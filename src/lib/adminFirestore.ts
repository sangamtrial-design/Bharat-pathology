import {
  db,
  handleFirestoreError,
  OperationType
} from './firebase';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  setDoc,
  getDocs,
  getDoc,
  addDoc
} from 'firebase/firestore';
import {
  BookingItem,
  BookingStatus,
  PaymentStatus,
  LabSettings,
  AuditLogEntry,
  AdminUser,
  MessageTemplate,
  InternalNote
} from '../types/admin';
import { LAB_DETAILS, HEALTH_PACKAGES, TEST_DROPDOWN_OPTIONS, FAQS_DATA } from '../data';

// Default settings fallback
export const DEFAULT_SETTINGS: LabSettings = {
  labName: LAB_DETAILS.name,
  tagline: LAB_DETAILS.tagline,
  phone: LAB_DETAILS.phoneDisplay,
  whatsapp: '+91 88877 90574',
  emergencyPhone: '+91 88877 90574',
  address: LAB_DETAILS.address,
  hours: LAB_DETAILS.hours,
  upiPayeeName: LAB_DETAILS.upiPayeeName,
  upiId: LAB_DETAILS.upiIdPlaceholder,
  defaultCollectionCharge: 0,
  freeHomeCollectionThreshold: 500,
  gstNumber: '',
  regNumber: '',
  // 5 Different Color Themes: 'teal' | 'blue' | 'emerald' | 'purple' | 'rose'
  theme: 'teal',
  // Hero & Live Website Content
  heroHeadline: 'Pathology testing, closer to home.',
  heroHeadlineHi: 'विश्वसनीय पैथोलॉजी जांच, आपके घर के करीब।',
  heroSubhead: 'Local laboratory testing and home sample collection from Bharat Pathology on Balauli Road, Bhimpura No. 1.',
  heroSubheadHi: 'बलौली रोड, भीमपुरा नं. 1 स्थित भारत पैथोलॉजी द्वारा स्थानीय लैब परीक्षण एवं घर से सैंपल कलेक्शन की विश्वसनीय सुविधा।',
  badgeText: 'Local Pathology Laboratory in Ballia',
  badgeTextHi: 'बलिया में स्थानीय पैथोलॉजी प्रयोगशाला',
  discountNotice: '₹0 Collection fee for nearby localities & seniors.',
  // Trust Card & Credentials fields (Empty string = section hidden; OWNER TO FILL)
  labInchargeName: '', // OWNER TO FILL
  qualification: '', // OWNER TO FILL
  registrationNumber: '', // OWNER TO FILL
  nablStatus: '', // OWNER TO FILL
  labRegistrationNumber: '', // OWNER TO FILL
  // Service Areas for Home Collection (Empty array = displays contact lab message; OWNER TO FILL)
  serviceAreas: [], // OWNER TO FILL
  announcementActive: false,
  announcementText: '',
  announcementType: 'info',
  soundAlerts: true,
  blockedDates: [],
  timeSlots: [
    '08:00 AM - 09:30 AM',
    '09:30 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '01:00 PM - 03:00 PM',
    '03:00 PM - 05:00 PM',
    '05:00 PM - 07:00 PM'
  ],
  maxCapacityPerSlot: 6
};

// Default message templates
export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl_confirmed',
    title: 'Booking Confirmed',
    category: 'confirmation',
    content:
      'Hello {name}, your sample collection request ({test}) is confirmed for {date} during slot {time}. Our phlebotomist {collector} will arrive at your address. Total: {amount}. Regards, Bharat Pathology.'
  },
  {
    id: 'tpl_dispatch',
    title: 'Collector on the Way',
    category: 'dispatch',
    content:
      'Hello {name}, our technician {collector} is on the way to your address for sample collection ({test}). Please ensure required fasting/preparation is observed. Regards, Bharat Pathology.'
  },
  {
    id: 'tpl_payment_verified',
    title: 'Payment Received',
    category: 'payment',
    content:
      'Hello {name}, we have verified your UPI payment of {amount} for booking {refId}. Thank you for choosing Bharat Pathology!'
  },
  {
    id: 'tpl_payment_mismatch',
    title: 'Payment Mismatch Notice',
    category: 'payment',
    content:
      'Hello {name}, we noted a discrepancy in the payment reference for booking {refId}. Please contact Bharat Pathology at +91 88877 90574 with transaction screenshot.'
  },
  {
    id: 'tpl_report_ready',
    title: 'Report Ready',
    category: 'report',
    content:
      'Hello {name}, your pathology report for {test} is ready. We can share a digital copy on WhatsApp or you may collect the printed report from our lab at Bhimpura No. 1, Balauli Road.'
  },
  {
    id: 'tpl_reschedule',
    title: 'Reschedule Request',
    category: 'reschedule',
    content:
      'Hello {name}, regarding your sample collection request for {date}, please contact Bharat Pathology to confirm a suitable rescheduled time slot.'
  }
];

/**
 * Normalise raw booking document with safe defaults
 */
export function normaliseBooking(docId: string, data: any): BookingItem {
  return {
    id: docId,
    name: data.name || data.patientName || 'Unnamed Patient',
    phone: data.phone || '',
    gender: data.gender || 'Prefer not to say',
    age: Number(data.age) || 0,
    testOrPackage: data.testOrPackage || 'General Diagnostic Test',
    preferredDate: data.preferredDate || '',
    address: data.address || data.collectionAddress || '',
    paymentPreference: data.paymentPreference || data.paymentChoice || 'store',
    transactionRef: data.transactionRef || '',
    message: data.message || data.additionalMessage || '',
    createdAt: data.createdAt || new Date().toISOString(),

    // Admin fields with safe defaults
    status: (data.status as BookingStatus) || 'New',
    paymentStatus: (data.paymentStatus as PaymentStatus) || (data.paymentPreference === 'upi' ? 'UPI Pending Verification' : 'Pay at Lab'),
    amountQuoted: Number(data.amountQuoted) || 0,
    amountReceived: Number(data.amountReceived) || 0,
    collectionCharge: Number(data.collectionCharge) || 0,
    discount: Number(data.discount) || 0,
    confirmedDate: data.confirmedDate || data.preferredDate || '',
    confirmedTimeSlot: data.confirmedTimeSlot || '',
    assignedCollector: data.assignedCollector || '',
    priority: data.priority || 'Normal',
    tests: Array.isArray(data.tests) ? data.tests : [],
    reportStatus: data.reportStatus || 'Not Started',
    reportDeliveryMode: data.reportDeliveryMode || 'WhatsApp',
    internalNotes: Array.isArray(data.internalNotes) ? data.internalNotes : [],
    statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    followUpDate: data.followUpDate || '',

    isDeleted: Boolean(data.isDeleted),
    deletedAt: data.deletedAt || undefined,
    deletedBy: data.deletedBy || undefined,
    updatedAt: data.updatedAt || undefined,
    updatedBy: data.updatedBy || undefined,
    verifiedBy: data.verifiedBy || undefined,
    verifiedAt: data.verifiedAt || undefined,
    paymentNotes: data.paymentNotes || undefined
  };
}

/**
 * Audit Logger
 */
export async function logAudit(entry: Omit<AuditLogEntry, 'id' | 'at'>) {
  try {
    const auditId = 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const docRef = doc(db, 'auditLogs', auditId);
    await setDoc(docRef, {
      ...entry,
      id: auditId,
      at: new Date().toISOString()
    });
  } catch (err) {
    // Non-blocking log error
    console.warn('Audit logging failed:', err);
  }
}

/**
 * Subscribe to all bookings with real-time updates
 */
export function subscribeToBookings(
  onData: (bookings: BookingItem[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'bookings');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: BookingItem[] = [];
      snapshot.forEach((d) => {
        items.push(normaliseBooking(d.id, d.data()));
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(items);
    },
    (err) => {
      console.warn('Bookings subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Helper to strip any undefined values from an object recursively
 */
export function sanitizeFirestoreData<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        result[key] = sanitizeFirestoreData(val);
      } else if (Array.isArray(val)) {
        result[key] = val.map((item) =>
          item !== null && typeof item === 'object' && !(item instanceof Date)
            ? sanitizeFirestoreData(item)
            : item
        );
      } else {
        result[key] = val;
      }
    }
  }
  return result as T;
}

/**
 * Generate formatted SMS confirmation message for accepted booking
 */
export function buildConfirmationSMS(booking: BookingItem, settings?: LabSettings): string {
  const labName = settings?.labName || 'Bharat Pathology';
  const labPhone = settings?.phone || '+91 88877 90574';
  const date = booking.confirmedDate || booking.preferredDate || 'Scheduled Day';
  const slot = booking.confirmedTimeSlot || booking.timeSlot || 'Morning';
  const testName = booking.testOrPackage || 'Pathology Test';
  const amount = Number(booking.amountQuoted) || 0;
  const paymentMode = booking.paymentPreference === 'upi' ? 'Online UPI' : 'Pay at Lab / Collection';

  return `✅ ${labName} - Booking Confirmed!\n\nDear ${booking.name},\nYour sample collection request has been ACCEPTED.\n\n📋 Ref ID: #${booking.id.slice(-6).toUpperCase()}\n🧪 Test: ${testName}\n📅 Date: ${date}\n⏰ Slot: ${slot}\n📍 Address: ${booking.address}\n💰 Total: ₹${amount} (${paymentMode})\n\nOur phlebotomist will arrive during your scheduled time.\n📞 Lab Helpline: ${labPhone}\nBhimpura No. 1, Balauli Road, Ballia`;
}

/**
 * Get direct SMS protocol link (opens native messaging app)
 */
export function getSMSHref(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const target = cleanPhone.length === 10 ? `+91${cleanPhone}` : phone;
  return `sms:${target}?body=${encodeURIComponent(message)}`;
}

/**
 * Get WhatsApp direct chat link
 */
export function getWhatsAppHref(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const digits = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Update single booking status with history & audit trail safely
 */
export async function updateBookingStatus(
  booking: BookingItem,
  newStatus: BookingStatus,
  actor: { name: string; email: string },
  note?: string
) {
  const docRef = doc(db, 'bookings', booking.id);
  const now = new Date().toISOString();

  const historyEntry: Record<string, any> = {
    status: newStatus,
    by: `${actor.name || 'Admin'} (${actor.email || 'admin@bharatpathology.in'})`,
    at: now
  };
  if (note && typeof note === 'string' && note.trim().length > 0) {
    historyEntry.note = note.trim();
  }

  // Ensure existing history doesn't contain undefined
  const prevHistory = Array.isArray(booking.statusHistory)
    ? booking.statusHistory.map((item) => {
        const cleanItem: Record<string, any> = {
          status: item.status,
          by: item.by,
          at: item.at
        };
        if (item.note) cleanItem.note = item.note;
        return cleanItem;
      })
    : [];

  const newHistory = [...prevHistory, historyEntry];

  const updateData: Record<string, any> = {
    status: newStatus,
    statusHistory: newHistory,
    updatedAt: now,
    updatedBy: actor.email || 'admin@bharatpathology.in'
  };

  // If status is Confirmed, also sync confirmedDate & confirmedTimeSlot if missing
  if (newStatus === 'Confirmed') {
    if (!booking.confirmedDate && booking.preferredDate) {
      updateData.confirmedDate = booking.preferredDate;
    }
    if (!booking.confirmedTimeSlot && booking.timeSlot) {
      updateData.confirmedTimeSlot = booking.timeSlot;
    }
  }

  await updateDoc(docRef, sanitizeFirestoreData(updateData));

  await logAudit({
    action: `Changed status to "${newStatus}"`,
    entityType: 'booking',
    entityId: booking.id,
    by: actor.name || 'Admin',
    byEmail: actor.email || 'admin@bharatpathology.in',
    details: `Status updated from ${booking.status} to ${newStatus}${note ? ': ' + note : ''}`,
    before: { status: booking.status },
    after: { status: newStatus }
  });
}

/**
 * Update arbitrary booking fields with audit safely
 */
export async function updateBooking(
  bookingId: string,
  updates: Partial<BookingItem>,
  actor: { name: string; email: string },
  auditSummary?: string
) {
  const docRef = doc(db, 'bookings', bookingId);
  const now = new Date().toISOString();

  const payload: Record<string, any> = {
    ...updates,
    updatedAt: now,
    updatedBy: actor.email || 'admin@bharatpathology.in'
  };

  await updateDoc(docRef, sanitizeFirestoreData(payload));

  await logAudit({
    action: 'Updated booking details',
    entityType: 'booking',
    entityId: bookingId,
    by: actor.name || 'Admin',
    byEmail: actor.email || 'admin@bharatpathology.in',
    details: auditSummary || `Updated fields: ${Object.keys(updates).join(', ')}`,
    after: sanitizeFirestoreData(updates)
  });
}

/**
 * Soft delete booking
 */
export async function softDeleteBooking(
  bookingId: string,
  actor: { name: string; email: string }
) {
  const docRef = doc(db, 'bookings', bookingId);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    isDeleted: true,
    deletedAt: now,
    deletedBy: actor.email,
    updatedAt: now,
    updatedBy: actor.email
  });

  await logAudit({
    action: 'Moved to Trash (Soft delete)',
    entityType: 'booking',
    entityId: bookingId,
    by: actor.name,
    byEmail: actor.email,
    details: `Booking ${bookingId} soft-deleted`
  });
}

/**
 * Restore soft-deleted booking
 */
export async function restoreBooking(
  bookingId: string,
  actor: { name: string; email: string }
) {
  const docRef = doc(db, 'bookings', bookingId);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    updatedAt: now,
    updatedBy: actor.email
  });

  await logAudit({
    action: 'Restored from Trash',
    entityType: 'booking',
    entityId: bookingId,
    by: actor.name,
    byEmail: actor.email,
    details: `Booking ${bookingId} restored to active list`
  });
}

/**
 * Permanently delete booking (Owner only)
 */
export async function permanentlyDeleteBooking(
  bookingId: string,
  actor: { name: string; email: string }
) {
  const docRef = doc(db, 'bookings', bookingId);
  await deleteDoc(docRef);

  await logAudit({
    action: 'PERMANENTLY DELETED BOOKING',
    entityType: 'booking',
    entityId: bookingId,
    by: actor.name,
    byEmail: actor.email,
    details: `Permanent deletion of booking record ${bookingId}`
  });
}

/**
 * Verify UPI Payment
 */
export async function verifyUPIPayment(
  booking: BookingItem,
  amountReceived: number,
  actor: { name: string; email: string },
  note?: string
) {
  const docRef = doc(db, 'bookings', booking.id);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    paymentStatus: 'Paid (Verified)',
    amountReceived,
    verifiedBy: `${actor.name} (${actor.email})`,
    verifiedAt: now,
    paymentNotes: note || 'UPI transaction verified against bank ledger',
    updatedAt: now,
    updatedBy: actor.email
  });

  await logAudit({
    action: 'Verified UPI Payment',
    entityType: 'payment',
    entityId: booking.id,
    by: actor.name,
    byEmail: actor.email,
    details: `Verified ₹${amountReceived} against UTR ${booking.transactionRef || 'N/A'}`
  });
}

/**
 * Mark payment mismatch
 */
export async function markPaymentMismatch(
  booking: BookingItem,
  reason: string,
  actor: { name: string; email: string }
) {
  const docRef = doc(db, 'bookings', booking.id);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    paymentStatus: 'Amount Mismatch',
    paymentNotes: `Mismatch reason: ${reason}`,
    updatedAt: now,
    updatedBy: actor.email
  });

  await logAudit({
    action: 'Payment Mismatch Flagged',
    entityType: 'payment',
    entityId: booking.id,
    by: actor.name,
    byEmail: actor.email,
    details: `Reason: ${reason}`
  });
}

/**
 * Refund or adjust payment
 */
export async function refundOrAdjustPayment(
  booking: BookingItem,
  type: 'Refunded' | 'Adjusted',
  amount: number,
  reason: string,
  actor: { name: string; email: string }
) {
  const docRef = doc(db, 'bookings', booking.id);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    paymentStatus: type,
    paymentNotes: `${type} ₹${amount}. Reason: ${reason}`,
    updatedAt: now,
    updatedBy: actor.email
  });

  await logAudit({
    action: `Payment ${type}`,
    entityType: 'payment',
    entityId: booking.id,
    by: actor.name,
    byEmail: actor.email,
    details: `${type} of ₹${amount}. ${reason}`
  });
}

/**
 * Add internal note
 */
export async function addInternalNote(
  booking: BookingItem,
  text: string,
  actor: { name: string; email: string }
) {
  const docRef = doc(db, 'bookings', booking.id);
  const now = new Date().toISOString();

  const newNote: InternalNote = {
    id: 'note_' + Date.now(),
    text: text.trim(),
    author: actor.name,
    authorEmail: actor.email,
    timestamp: now
  };

  const updatedNotes = [...(booking.internalNotes || []), newNote];

  await updateDoc(docRef, {
    internalNotes: updatedNotes,
    updatedAt: now,
    updatedBy: actor.email
  });

  await logAudit({
    action: 'Added Internal Note',
    entityType: 'booking',
    entityId: booking.id,
    by: actor.name,
    byEmail: actor.email,
    details: `Note added by ${actor.name}`
  });
}

/**
 * Bulk updates
 */
export async function bulkUpdateBookings(
  bookingIds: string[],
  updates: Partial<BookingItem>,
  actor: { name: string; email: string },
  summary: string
) {
  const now = new Date().toISOString();
  for (const id of bookingIds) {
    const docRef = doc(db, 'bookings', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
      updatedBy: actor.email
    });
  }

  await logAudit({
    action: 'Bulk Booking Update',
    entityType: 'booking',
    entityId: `${bookingIds.length} items`,
    by: actor.name,
    byEmail: actor.email,
    details: `${summary} on ${bookingIds.length} bookings`
  });
}

/**
 * Settings listener & updater
 */
export function subscribeToSettings(onData: (settings: LabSettings) => void) {
  const docRef = doc(db, 'settings', 'general');
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      onData({ ...DEFAULT_SETTINGS, ...snap.data() });
    } else {
      onData(DEFAULT_SETTINGS);
    }
  });
}

export async function updateLabSettings(
  settings: LabSettings,
  actor: { name: string; email: string }
) {
  const docRef = doc(db, 'settings', 'general');
  await setDoc(docRef, sanitizeFirestoreData(settings), { merge: true });

  await logAudit({
    action: 'Updated Business Settings',
    entityType: 'settings',
    entityId: 'general',
    by: actor.name,
    byEmail: actor.email,
    details: `Lab settings updated by ${actor.name}`
  });
}

/**
 * Staff management
 */
export function subscribeToStaff(onData: (staff: AdminUser[]) => void) {
  const colRef = collection(db, 'admins');
  return onSnapshot(colRef, (snap) => {
    const staffList: AdminUser[] = [];
    snap.forEach((d) => {
      const data = d.data();
      staffList.push({
        uid: d.id,
        email: data.email || '',
        name: data.name || 'Staff Member',
        role: data.role || 'staff',
        active: Boolean(data.active),
        createdAt: data.createdAt || new Date().toISOString(),
        phone: data.phone || ''
      });
    });
    onData(staffList);
  });
}

export async function updateStaffMember(
  uid: string,
  data: Partial<AdminUser>,
  actor: { name: string; email: string }
) {
  const docRef = doc(db, 'admins', uid);
  await setDoc(docRef, data, { merge: true });

  await logAudit({
    action: 'Updated Staff Account',
    entityType: 'admin',
    entityId: uid,
    by: actor.name,
    byEmail: actor.email,
    details: `Updated staff permissions for ${data.email || uid}`
  });
}

/**
 * Audit Log listener
 */
export function subscribeToAuditLogs(onData: (logs: AuditLogEntry[]) => void) {
  const colRef = collection(db, 'auditLogs');
  return onSnapshot(colRef, (snap) => {
    const list: AuditLogEntry[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as AuditLogEntry);
    });
    list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    onData(list);
  });
}

/**
 * Message templates listener & updater
 */
export function subscribeToTemplates(onData: (templates: MessageTemplate[]) => void) {
  const colRef = collection(db, 'messageTemplates');
  return onSnapshot(colRef, (snap) => {
    if (snap.empty) {
      onData(DEFAULT_TEMPLATES);
    } else {
      const list: MessageTemplate[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as MessageTemplate);
      });
      onData(list);
    }
  });
}

export async function saveMessageTemplate(
  tpl: MessageTemplate,
  actor: { name: string; email: string }
) {
  const docRef = doc(db, 'messageTemplates', tpl.id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...tpl, updatedAt: now });

  await logAudit({
    action: 'Saved Message Template',
    entityType: 'template',
    entityId: tpl.id,
    by: actor.name,
    byEmail: actor.email,
    details: `Updated template: ${tpl.title}`
  });
}
