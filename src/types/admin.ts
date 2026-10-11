export type AdminRole = 'owner' | 'staff';

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  phone?: string;
}

export type BookingStatus =
  | 'New'
  | 'Contacted'
  | 'Confirmed'
  | 'Collector Assigned'
  | 'Sample Collected'
  | 'Processing'
  | 'Report Ready'
  | 'Completed'
  | 'Rescheduled'
  | 'Cancelled'
  | 'No-show';

export type PaymentStatus =
  | 'Unpaid'
  | 'UPI Pending Verification'
  | 'Paid (Verified)'
  | 'Pay at Lab'
  | 'Amount Mismatch'
  | 'Refunded'
  | 'Adjusted';

export type PriorityLevel = 'Normal' | 'Urgent';

export type ReportStatus = 'Not Started' | 'In Progress' | 'Ready' | 'Delivered';

export type ReportDeliveryMode = 'WhatsApp' | 'Printed copy' | 'Other';

export interface InternalNote {
  id: string;
  text: string;
  author: string;
  authorEmail?: string;
  timestamp: string;
}

export interface StatusHistoryEntry {
  status: BookingStatus;
  by: string;
  at: string;
  note?: string;
}

export interface BookingItem {
  id: string;
  // Core patient & test fields
  name: string;
  phone: string;
  gender: 'Female' | 'Male' | 'Other' | 'Prefer not to say' | string;
  age: number;
  testOrPackage: string;
  preferredDate: string;
  address: string;
  paymentPreference: 'upi' | 'store' | string;
  transactionRef?: string;
  message?: string;
  createdAt: string;

  // New Booking Form fields
  timeSlot?: string;
  areaOrPincode?: string;
  consentAgreed?: boolean;
  prescriptionPath?: string;
  prescriptionFileName?: string;

  // Extended Admin fields
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amountQuoted: number;
  amountReceived: number;
  collectionCharge: number;
  discount: number;
  confirmedDate?: string;
  confirmedTimeSlot?: string;
  assignedCollector?: string;
  priority: PriorityLevel;
  tests?: Array<{ name: string; price: number }>;
  reportStatus: ReportStatus;
  reportDeliveryMode?: ReportDeliveryMode;
  internalNotes?: InternalNote[];
  statusHistory?: StatusHistoryEntry[];
  tags?: string[];
  followUpDate?: string;

  // Audit / Soft delete metadata
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  paymentNotes?: string;
}

export type WebsiteTheme = 'teal' | 'blue' | 'emerald' | 'purple' | 'rose';

export interface LabSettings {
  labName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  emergencyPhone?: string;
  address: string;
  hours: string;
  upiPayeeName: string;
  upiId: string;
  defaultCollectionCharge: number;
  freeHomeCollectionThreshold?: number;
  googleMapsUrl?: string;
  gstNumber?: string;
  regNumber?: string;
  // Theme selection (5 themes)
  theme?: WebsiteTheme;
  // Hero & Live Website Content
  heroHeadline?: string;
  heroHeadlineHi?: string;
  heroSubhead?: string;
  heroSubheadHi?: string;
  badgeText?: string;
  badgeTextHi?: string;
  discountNotice?: string;
  // Trust Card & Credentials fields (Empty = section hidden; OWNER TO FILL)
  labInchargeName?: string;
  qualification?: string;
  registrationNumber?: string;
  nablStatus?: string;
  labRegistrationNumber?: string;
  // Service Areas for Home Sample Collection
  serviceAreas?: string[];
  announcementActive: boolean;
  announcementText: string;
  announcementType?: 'info' | 'alert' | 'offer';
  soundAlerts: boolean;
  blockedDates: string[];
  timeSlots: string[];
  maxCapacityPerSlot: number;
  // SMS Notification settings
  smsGatewayUrl?: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: 'confirmation' | 'dispatch' | 'payment' | 'report' | 'reschedule' | 'custom';
  content: string;
  updatedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: 'booking' | 'payment' | 'settings' | 'admin' | 'template' | 'content';
  entityId: string;
  by: string;
  byEmail: string;
  at: string;
  details: string;
  before?: any;
  after?: any;
}

export interface PatientRecord {
  phone: string;
  name: string;
  age: number;
  gender: string;
  address: string;
  totalBookings: number;
  lastVisit: string;
  latestStatus: BookingStatus;
  bookings: BookingItem[];
  patientNotes?: string[];
}
