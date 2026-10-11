import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDocFromServer,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  limit
} from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { PRICED_PACKAGES_MAP } from '../data';
import { BookingItem } from '../types/admin';

// Initialize Firebase App using project configuration with optional env overrides
const activeFirebaseConfig = {
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || firebaseConfig.projectId,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || firebaseConfig.appId,
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || firebaseConfig.apiKey,
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || firebaseConfig.authDomain,
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_DATABASE_ID as string) || firebaseConfig.firestoreDatabaseId,
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || firebaseConfig.storageBucket,
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || firebaseConfig.messagingSenderId,
};

const app = initializeApp(activeFirebaseConfig);

// CRITICAL: Must initialize Firestore using the specific firestoreDatabaseId from config
export const db = getFirestore(app, activeFirebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app, activeFirebaseConfig.storageBucket);

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
};
export type { User };

// Operation types for standard error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

/**
 * Standard Firestore error handling helper per Firebase skill specifications
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  // Never log patient private details in the console
  console.error('Firestore Operation Failed:', operationType, path, errInfo.error);
  throw new Error(JSON.stringify(errInfo));
}

export interface PatientBookingRequest {
  patientName?: string;
  name?: string;
  phone: string;
  gender: 'Female' | 'Male' | 'Other' | 'Prefer not to say' | string;
  age: number;
  testOrPackage: string;
  preferredDate: string;
  timeSlot?: string;
  areaOrPincode?: string;
  consentAgreed?: boolean;
  paymentChoice?: 'upi' | 'store' | string;
  paymentPreference?: 'upi' | 'store' | string;
  collectionAddress?: string;
  address?: string;
  transactionRef?: string;
  additionalMessage?: string;
  message?: string;
  prescriptionFile?: File | null;
}

export type CollectionRequestPayload = PatientBookingRequest;

/**
 * Generate a short, human-friendly booking reference ID like BP-94721
 */
export function generateShortBookingId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BP-${rand}`;
}

/**
 * Helper function to store patient booking requests in Firestore 'bookings' collection
 * Reuses the existing schema and seeds full default fields expected by the Admin panel.
 */
export async function storePatientBookingRequest(requestData: PatientBookingRequest): Promise<string> {
  const shortId = generateShortBookingId();
  const bookingId = shortId;
  const path = `bookings/${bookingId}`;

  const patientName = (requestData.name || requestData.patientName || '').trim().slice(0, 100);
  const address = (requestData.address || requestData.collectionAddress || '').trim().slice(0, 500);
  const paymentPref = (requestData.paymentPreference || requestData.paymentChoice || 'store');
  const message = (requestData.message || requestData.additionalMessage || '').trim();

  // Clean phone to ensure strictly valid length (10-15 chars)
  const rawPhone = (requestData.phone || '').trim();
  const cleanedPhone = rawPhone.replace(/[^\d+]/g, '').slice(0, 15);

  // Determine amount quoted from package if listed
  const packageMatch = PRICED_PACKAGES_MAP[requestData.testOrPackage];
  const amountQuoted = packageMatch ? packageMatch.price : 0;

  let prescriptionPath = '';
  let prescriptionFileName = '';

  // Optional prescription upload to Firebase Storage
  if (requestData.prescriptionFile) {
    try {
      const sanitizedName = requestData.prescriptionFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      prescriptionPath = `prescriptions/${bookingId}/${sanitizedName}`;
      prescriptionFileName = sanitizedName;
      const fileRef = storageRef(storage, prescriptionPath);
      await uploadBytes(fileRef, requestData.prescriptionFile);
    } catch (uploadErr) {
      console.warn('Prescription file upload non-fatal warning:', uploadErr);
      // We do not fail the booking if upload fails due to network, but proceed
    }
  }

  const payload: Partial<BookingItem> & Record<string, any> = {
    id: bookingId,
    name: patientName,
    phone: cleanedPhone,
    gender: requestData.gender,
    age: Number(requestData.age),
    testOrPackage: requestData.testOrPackage.slice(0, 150),
    preferredDate: (requestData.preferredDate || '').slice(0, 20),
    timeSlot: requestData.timeSlot || '',
    areaOrPincode: requestData.areaOrPincode || '',
    consentAgreed: requestData.consentAgreed ?? true,
    address,
    paymentPreference: paymentPref,
    transactionRef: requestData.transactionRef ? requestData.transactionRef.trim() : '',
    message,
    prescriptionPath,
    prescriptionFileName,
    createdAt: new Date().toISOString(),

    // Admin workflow default fields
    status: 'New',
    paymentStatus: paymentPref === 'upi' ? 'UPI Pending Verification' : 'Pay at Lab',
    amountQuoted,
    amountReceived: 0,
    collectionCharge: 0,
    discount: 0,
    priority: 'Normal',
    reportStatus: 'Not Started',
    isDeleted: false,
    internalNotes: [],
    statusHistory: [
      {
        status: 'New',
        by: 'Public Web Portal',
        at: new Date().toISOString(),
        note: 'Online booking request submitted'
      }
    ],
    tags: []
  };

  try {
    const docRef = doc(db, 'bookings', bookingId);
    await setDoc(docRef, payload);

    // Also write a reference to collectionRequests for complete backwards compatibility
    try {
      await setDoc(doc(db, 'collectionRequests', bookingId), {
        ...payload,
        patientName,
        collectionAddress: address,
        paymentChoice: paymentPref
      });
    } catch {
      // Ignored non-fatal mirror write
    }

    return bookingId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export const saveCollectionRequest = storePatientBookingRequest;

/**
 * Validates connection to Firestore on initialization
 */
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline status:', error.message);
    }
  }
}

testConnection();
