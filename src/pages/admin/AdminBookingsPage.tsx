import React, { useState, useMemo } from 'react';
import {
  BookingItem,
  BookingStatus,
  PaymentStatus,
  PriorityLevel,
  ReportStatus,
  LabSettings
} from '../../types/admin';
import {
  formatCurrency,
  formatDate,
  exportBookingsToCSV,
  printBookingReceipt
} from '../../lib/exportUtils';
import {
  updateBookingStatus,
  updateBooking,
  softDeleteBooking,
  restoreBooking,
  permanentlyDeleteBooking,
  addInternalNote,
  bulkUpdateBookings
} from '../../lib/adminFirestore';
import { useAdminAuth } from '../../lib/adminAuth';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  RefreshCw,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Tag,
  Download,
  Printer,
  ChevronRight,
  MoreVertical,
  X,
  Send,
  Eye,
  SlidersHorizontal,
  Flame,
  CreditCard,
  FileCheck2,
  ExternalLink,
  ClipboardList,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { TEST_DROPDOWN_OPTIONS, PRICED_PACKAGES_MAP } from '../../data';
import { BookingSmsModal } from '../../components/admin/BookingSmsModal';

interface AdminBookingsPageProps {
  bookings: BookingItem[];
  settings: LabSettings;
  selectedBookingDetail?: BookingItem | null;
  onClearSelectedBookingDetail?: () => void;
}

const ALL_STATUSES: BookingStatus[] = [
  'New',
  'Contacted',
  'Confirmed',
  'Collector Assigned',
  'Sample Collected',
  'Processing',
  'Report Ready',
  'Completed',
  'Rescheduled',
  'Cancelled',
  'No-show'
];

const ALL_PAYMENT_STATUSES: PaymentStatus[] = [
  'Unpaid',
  'UPI Pending Verification',
  'Paid (Verified)',
  'Pay at Lab',
  'Amount Mismatch',
  'Refunded',
  'Adjusted'
];

export const AdminBookingsPage: React.FC<AdminBookingsPageProps> = ({
  bookings,
  settings,
  selectedBookingDetail,
  onClearSelectedBookingDetail
}) => {
  const { adminData, isOwner } = useAdminAuth();

  // Active view: 'active' | 'trash'
  const [viewTab, setViewTab] = useState<'active' | 'trash'>('active');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [collectorFilter, setCollectorFilter] = useState<string>('all');
  const [dateQuickChip, setDateQuickChip] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'urgent' | 'unverified'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Selected Booking Drawer
  const [activeBooking, setActiveBooking] = useState<BookingItem | null>(selectedBookingDetail || null);

  // Undo status history state
  const [lastUndoState, setLastUndoState] = useState<{ bookingId: string; prevStatus: BookingStatus } | null>(null);

  // Manual Add Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGender, setNewGender] = useState('Female');
  const [newAge, setNewAge] = useState('30');
  const [newTest, setNewTest] = useState(TEST_DROPDOWN_OPTIONS[0]);
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTimeSlot, setNewTimeSlot] = useState(settings.timeSlots[0] || '08:00 AM - 09:30 AM');
  const [newAddress, setNewAddress] = useState('');
  const [newPaymentPref, setNewPaymentPref] = useState<'store' | 'upi'>('store');
  const [newAmountQuoted, setNewAmountQuoted] = useState('0');
  const [newCollector, setNewCollector] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('Normal');
  const [newMessage, setNewMessage] = useState('');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Permanent Delete Modal (Owner only)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<BookingItem | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Note input in Drawer
  const [newNoteText, setNewNoteText] = useState('');

  // Status Action feedback and SMS modal states
  const [smsModalBooking, setSmsModalBooking] = useState<BookingItem | null>(null);
  const [statusActionError, setStatusActionError] = useState<string | null>(null);
  const [statusActionSuccess, setStatusActionSuccess] = useState<string | null>(null);
  const [acceptingBookingId, setAcceptingBookingId] = useState<string | null>(null);

  // Update activeBooking if prop changes
  React.useEffect(() => {
    if (selectedBookingDetail) {
      setActiveBooking(selectedBookingDetail);
    }
  }, [selectedBookingDetail]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Trash vs Active view
      if (viewTab === 'trash' && !b.isDeleted) return false;
      if (viewTab === 'active' && b.isDeleted) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesPhone = b.phone.includes(q);
        const matchesTest = b.testOrPackage.toLowerCase().includes(q);
        const matchesRef = (b.transactionRef || '').toLowerCase().includes(q);
        const matchesId = b.id.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesTest && !matchesRef && !matchesId) {
          return false;
        }
      }

      // Quick Chips
      if (dateQuickChip === 'today') {
        const d = (b.confirmedDate || b.preferredDate || '').substring(0, 10);
        if (d !== todayStr) return false;
      } else if (dateQuickChip === 'tomorrow') {
        const d = (b.confirmedDate || b.preferredDate || '').substring(0, 10);
        if (d !== tomorrowStr) return false;
      } else if (dateQuickChip === 'urgent') {
        if (b.priority !== 'Urgent') return false;
      } else if (dateQuickChip === 'unverified') {
        if (b.paymentStatus !== 'UPI Pending Verification') return false;
      }

      // Dropdown Filters
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (paymentFilter !== 'all' && b.paymentStatus !== paymentFilter) return false;
      if (priorityFilter !== 'all' && b.priority !== priorityFilter) return false;
      if (collectorFilter !== 'all' && b.assignedCollector !== collectorFilter) return false;

      return true;
    });
  }, [bookings, viewTab, searchQuery, dateQuickChip, statusFilter, paymentFilter, priorityFilter, collectorFilter, todayStr, tomorrowStr]);

  // Unique list of collectors
  const collectorsList = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      if (b.assignedCollector && b.assignedCollector.trim()) {
        set.add(b.assignedCollector.trim());
      }
    });
    return Array.from(set);
  }, [bookings]);

  // Paginated Slice
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;

  // Duplicate Checker
  const checkDuplicatesForBooking = (item: BookingItem): BookingItem[] => {
    if (!item.phone || !item.preferredDate) return [];
    return bookings.filter(
      (b) =>
        b.id !== item.id &&
        !b.isDeleted &&
        b.phone === item.phone &&
        (b.preferredDate === item.preferredDate || b.confirmedDate === item.confirmedDate)
    );
  };

  const currentDuplicates = useMemo(() => {
    if (!activeBooking) return [];
    return checkDuplicatesForBooking(activeBooking);
  }, [activeBooking, bookings]);

  // Actions
  const handleStatusChange = async (booking: BookingItem, newStatus: BookingStatus) => {
    setStatusActionError(null);
    try {
      const actorName = adminData?.name || 'Admin';
      const actorEmail = adminData?.email || 'admin@bharatpathology.in';
      const oldStatus = booking.status;
      setLastUndoState({ bookingId: booking.id, prevStatus: oldStatus });
      await updateBookingStatus(booking, newStatus, { name: actorName, email: actorEmail });
      if (activeBooking && activeBooking.id === booking.id) {
        setActiveBooking({ ...activeBooking, status: newStatus });
      }
      setStatusActionSuccess(`Booking #${booking.id.slice(-6).toUpperCase()} updated to "${newStatus}"`);
      setTimeout(() => setStatusActionSuccess(null), 3500);

      // If status is updated to Confirmed, open the SMS confirmation modal
      if (newStatus === 'Confirmed') {
        setSmsModalBooking({
          ...booking,
          status: 'Confirmed',
          confirmedDate: booking.confirmedDate || booking.preferredDate,
          confirmedTimeSlot: booking.confirmedTimeSlot || booking.timeSlot
        });
      }
    } catch (err: any) {
      console.error('Failed to change booking status:', err);
      setStatusActionError(err?.message || 'Error updating status. Please try again.');
    }
  };

  const handleAcceptBooking = async (booking: BookingItem) => {
    setAcceptingBookingId(booking.id);
    try {
      await handleStatusChange(booking, 'Confirmed');
    } finally {
      setAcceptingBookingId(null);
    }
  };

  const handleUndoStatus = async () => {
    if (!lastUndoState || !adminData) return;
    const target = bookings.find((b) => b.id === lastUndoState.bookingId);
    if (target) {
      await updateBookingStatus(target, lastUndoState.prevStatus, {
        name: adminData.name,
        email: adminData.email
      }, 'Action undone');
    }
    setLastUndoState(null);
  };

  const handleAddNote = async () => {
    if (!activeBooking || !newNoteText.trim() || !adminData) return;
    await addInternalNote(activeBooking, newNoteText, { name: adminData.name, email: adminData.email });
    setNewNoteText('');
    // refresh active booking
    const updated = bookings.find((b) => b.id === activeBooking.id);
    if (updated) setActiveBooking(updated);
  };

  const handleSoftDelete = async (b: BookingItem) => {
    if (!adminData) return;
    if (confirm(`Move booking ${b.id} for "${b.name}" to Trash?`)) {
      await softDeleteBooking(b.id, { name: adminData.name, email: adminData.email });
      if (activeBooking?.id === b.id) setActiveBooking(null);
    }
  };

  const handleRestore = async (b: BookingItem) => {
    if (!adminData) return;
    await restoreBooking(b.id, { name: adminData.name, email: adminData.email });
    if (activeBooking?.id === b.id) setActiveBooking(null);
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeleteTarget || !adminData || !isOwner) return;
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      alert('Please type DELETE in capital letters to confirm permanent deletion.');
      return;
    }
    await permanentlyDeleteBooking(permanentDeleteTarget.id, { name: adminData.name, email: adminData.email });
    setPermanentDeleteTarget(null);
    setDeleteConfirmationText('');
    if (activeBooking?.id === permanentDeleteTarget.id) setActiveBooking(null);
  };

  // Bulk Actions
  const handleBulkStatusChange = async (status: BookingStatus) => {
    if (!adminData || selectedIds.length === 0) return;
    if (confirm(`Update status of ${selectedIds.length} selected bookings to "${status}"?`)) {
      await bulkUpdateBookings(selectedIds, { status }, { name: adminData.name, email: adminData.email }, `Set status to ${status}`);
      setSelectedIds([]);
    }
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminData) return;

    const bookingId = 'BP_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const pkgMatch = PRICED_PACKAGES_MAP[newTest];
    const quoted = Number(newAmountQuoted) || (pkgMatch ? pkgMatch.price : 0);

    const payload: Partial<BookingItem> = {
      id: bookingId,
      name: newPatientName.trim(),
      phone: newPhone.trim(),
      gender: newGender,
      age: Number(newAge),
      testOrPackage: newTest,
      preferredDate: newDate,
      confirmedDate: newDate,
      confirmedTimeSlot: newTimeSlot,
      address: newAddress.trim() || 'Laboratory Counter Walk-in',
      paymentPreference: newPaymentPref,
      amountQuoted: quoted,
      amountReceived: 0,
      collectionCharge: 0,
      discount: 0,
      assignedCollector: newCollector,
      priority: newPriority,
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
      status: 'Confirmed',
      paymentStatus: newPaymentPref === 'upi' ? 'UPI Pending Verification' : 'Pay at Lab',
      reportStatus: 'Not Started',
      reportDeliveryMode: 'WhatsApp',
      isDeleted: false,
      internalNotes: [],
      statusHistory: [
        {
          status: 'Confirmed',
          by: `${adminData.name} (Direct Entry)`,
          at: new Date().toISOString(),
          note: 'Manually entered phone/walk-in booking'
        }
      ],
      tags: ['Manual Entry']
    };

    await updateBooking(bookingId, payload as any, { name: adminData.name, email: adminData.email }, 'Manual Walk-in / Phone booking created');
    setShowAddModal(false);
    // Reset form
    setNewPatientName('');
    setNewPhone('');
    setNewAddress('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Header & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bookings & Patient Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage home collections, walk-in diagnostic appointments, and report workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Active vs Trash view tab */}
          <div className="p-1 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center text-xs font-semibold">
            <button
              onClick={() => {
                setViewTab('active');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewTab === 'active'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Active ({bookings.filter((b) => !b.isDeleted).length})
            </button>
            <button
              onClick={() => {
                setViewTab('trash');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewTab === 'trash'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Trash ({bookings.filter((b) => b.isDeleted).length})
            </button>
          </div>

          {/* Add Manual Booking */}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Undo Alert Banner if available */}
      {lastUndoState && (
        <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-800 text-teal-950 dark:text-teal-200 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2">
          <span>Status updated successfully.</span>
          <button
            onClick={handleUndoStatus}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo Status Change</span>
          </button>
        </div>
      )}

      {/* Status Action Feedback Banners */}
      {statusActionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusActionSuccess}</span>
        </div>
      )}

      {statusActionError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{statusActionError}</span>
        </div>
      )}

      {/* Sticky Search & Multi-Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3.5">
        
        {/* Search Input + Quick Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by patient name, phone number, test, UTR, or BP ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportBookingsToCSV(filteredBookings, false)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer min-h-[40px]"
              title="Export filtered list to CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">Quick:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'today', label: 'Today Collections' },
            { id: 'tomorrow', label: 'Tomorrow' },
            { id: 'urgent', label: 'Urgent Only' },
            { id: 'unverified', label: 'UPI Unverified' }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => {
                setDateQuickChip(chip.id as any);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer text-xs font-semibold ${
                dateQuickChip === chip.id
                  ? 'bg-teal-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="all">All Statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payment</label>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="all">All Payment States</option>
              {ALL_PAYMENT_STATUSES.map((ps) => (
                <option key={ps} value={ps}>{ps}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Collector</label>
            <select
              value={collectorFilter}
              onChange={(e) => {
                setCollectorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="all">All Staff</option>
              {collectorsList.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Bulk Action Bar (When items are selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
          <div className="font-semibold">
            {selectedIds.length} booking{selectedIds.length > 1 ? 's' : ''} selected
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange('Confirmed')}
              className="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-600 font-semibold cursor-pointer"
            >
              Mark Confirmed
            </button>
            <button
              onClick={() => handleBulkStatusChange('Completed')}
              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 font-semibold cursor-pointer"
            >
              Mark Completed
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Bookings Table (Desktop) & Card List (Mobile) */}
      {paginatedBookings.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <div className="font-semibold text-sm">No bookings match the selected filters.</div>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search bar or filter chips.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === paginatedBookings.length && paginatedBookings.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(paginatedBookings.map((b) => b.id));
                        else setSelectedIds([]);
                      }}
                      className="rounded text-teal-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Test / Package</th>
                  <th className="py-3 px-3">Collection Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Collector</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {paginatedBookings.map((b) => {
                  const isUrgent = b.priority === 'Urgent';
                  const isSelected = selectedIds.includes(b.id);

                  return (
                    <tr
                      key={b.id}
                      onClick={() => setActiveBooking(b)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                        isSelected ? 'bg-teal-50/50 dark:bg-teal-950/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds([...selectedIds, b.id]);
                            else setSelectedIds(selectedIds.filter((id) => id !== b.id));
                          }}
                          className="rounded text-teal-600 cursor-pointer"
                        />
                      </td>

                      {/* Patient column */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                          {isUrgent && <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                          <span>{b.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{b.phone}</div>
                        <div className="text-[10px] text-slate-400">{b.gender}, {b.age}y</div>
                      </td>

                      {/* Test column */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {b.testOrPackage}
                        </div>
                        <div className="text-[11px] text-teal-700 dark:text-teal-400 font-bold">
                          {formatCurrency(b.amountQuoted)}
                        </div>
                      </td>

                      {/* Date & Slot */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {formatDate(b.confirmedDate || b.preferredDate)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.confirmedTimeSlot || 'Time to confirm'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : b.status === 'New'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                            : b.status === 'Cancelled'
                            ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {b.status}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.paymentStatus === 'Paid (Verified)'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : b.paymentStatus === 'UPI Pending Verification'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {b.paymentStatus}
                        </span>
                        {b.transactionRef && (
                          <div className="text-[9px] font-mono text-slate-400 truncate max-w-[100px]">
                            UTR: {b.transactionRef}
                          </div>
                        )}
                      </td>

                      {/* Collector */}
                      <td className="py-3 px-3">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {b.assignedCollector || <span className="text-slate-400 italic">Unassigned</span>}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'New' && (
                            <button
                              onClick={() => handleAcceptBooking(b)}
                              disabled={acceptingBookingId === b.id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                              title="Accept booking and send patient SMS"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                          )}

                          <button
                            onClick={() => printBookingReceipt(b, settings)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Print Booking Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setActiveBooking(b)}
                            className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 cursor-pointer"
                            title="View details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {paginatedBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => setActiveBooking(b)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      {b.priority === 'Urgent' && <Flame className="w-4 h-4 text-rose-500" />}
                      <span>{b.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{b.phone}</div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    b.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : b.status === 'New'
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {b.testOrPackage}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                  <div>Date: <strong>{formatDate(b.confirmedDate || b.preferredDate)}</strong></div>
                  <div>Pay: <strong>{b.paymentStatus}</strong></div>
                  <div>Fee: <strong className="text-teal-600">{formatCurrency(b.amountQuoted)}</strong></div>
                  <div>Collector: <strong>{b.assignedCollector || 'None'}</strong></div>
                </div>

                {b.status === 'New' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptBooking(b);
                    }}
                    disabled={acceptingBookingId === b.id}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Booking & Send Patient SMS</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-2">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredBookings.length)} of {filteredBookings.length}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer font-semibold"
              >
                Previous
              </button>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer font-semibold"
              >
                Next
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Booking Detail Drawer / Modal */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl overflow-hidden border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right-4 duration-300">
            
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base sm:text-lg">{activeBooking.name}</span>
                  <span className="text-xs font-mono text-slate-400">({activeBooking.id})</span>
                </div>
                <div className="text-xs text-slate-500">
                  Submitted {formatDate(activeBooking.createdAt)}
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveBooking(null);
                  if (onClearSelectedBookingDetail) onClearSelectedBookingDetail();
                }}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
              
              {/* Accept Booking Banner if New */}
              {activeBooking.status === 'New' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200 dark:border-teal-800 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-teal-900 dark:text-teal-200">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>New Booking Pending Acceptance</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Accept this request to confirm the appointment and immediately dispatch confirmation SMS to {activeBooking.name}.
                  </p>
                  <button
                    onClick={() => handleAcceptBooking(activeBooking)}
                    disabled={acceptingBookingId === activeBooking.id}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Booking & Send Patient SMS</span>
                  </button>
                </div>
              )}

              {/* Duplicate Detection Warning */}
              {currentDuplicates.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Potential Duplicate Booking Detected</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    Same phone ({activeBooking.phone}) has {currentDuplicates.length} other booking(s) on or around this date:
                  </p>
                  <div className="space-y-1 pt-1">
                    {currentDuplicates.map((dup) => (
                      <div key={dup.id} className="text-[11px] font-mono bg-white/60 dark:bg-black/30 p-1.5 rounded flex justify-between">
                        <span>ID: {dup.id} ({dup.testOrPackage})</span>
                        <span className="font-bold">{dup.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patient Contact & Quick Communication Cards */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Patient & Contact Details
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Phone:</span>
                    <span className="font-mono font-bold text-sm">{activeBooking.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Age / Gender:</span>
                    <span className="font-bold">{activeBooking.age} yrs / {activeBooking.gender}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-xs">Sample Collection Address:</span>
                  <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {activeBooking.address}
                  </div>
                </div>

                {activeBooking.message && (
                  <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 border border-amber-200/50">
                    <span className="font-bold">Patient Note: </span>
                    <span>{activeBooking.message}</span>
                  </div>
                )}

                {/* Direct Call & WhatsApp Action buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <a
                    href={`tel:${activeBooking.phone}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs hover:bg-slate-300 transition-colors min-h-[44px]"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>Call</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setSmsModalBooking(activeBooking)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors min-h-[44px] cursor-pointer shadow-xs"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Send SMS</span>
                  </button>

                  <a
                    href={`https://wa.me/91${activeBooking.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(activeBooking.name)}%2C%20regarding%20your%20booking%20with%20Bharat%20Pathology...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors min-h-[44px]"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeBooking.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition-colors min-h-[44px]"
                  >
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Maps</span>
                  </a>
                </div>
              </div>

              {/* Status & Assignment Editor */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Workflow & Scheduling
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeBooking.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                    {activeBooking.priority} Priority
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Status</label>
                    <select
                      value={activeBooking.status}
                      onChange={(e) => handleStatusChange(activeBooking, e.target.value as BookingStatus)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold"
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Assign Collector</label>
                    <input
                      type="text"
                      value={activeBooking.assignedCollector || ''}
                      placeholder="e.g. Ramesh Singh"
                      onChange={(e) => {
                        const val = e.target.value;
                        setActiveBooking({ ...activeBooking, assignedCollector: val });
                      }}
                      onBlur={() => {
                        if (adminData) {
                          updateBooking(activeBooking.id, { assignedCollector: activeBooking.assignedCollector }, { name: adminData.name, email: adminData.email }, `Assigned collector to ${activeBooking.assignedCollector}`);
                        }
                      }}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Confirmed Date</label>
                    <input
                      type="date"
                      value={activeBooking.confirmedDate || activeBooking.preferredDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setActiveBooking({ ...activeBooking, confirmedDate: val });
                        if (adminData) {
                          updateBooking(activeBooking.id, { confirmedDate: val }, { name: adminData.name, email: adminData.email });
                        }
                      }}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Time Slot</label>
                    <select
                      value={activeBooking.confirmedTimeSlot || settings.timeSlots[0]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setActiveBooking({ ...activeBooking, confirmedTimeSlot: val });
                        if (adminData) {
                          updateBooking(activeBooking.id, { confirmedTimeSlot: val }, { name: adminData.name, email: adminData.email });
                        }
                      }}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-medium"
                    >
                      {settings.timeSlots.map((ts) => (
                        <option key={ts} value={ts}>{ts}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial & Payment Tracker */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Payment Ledger
                  </div>
                  <button
                    onClick={() => printBookingReceipt(activeBooking, settings)}
                    className="inline-flex items-center gap-1 text-teal-600 text-xs font-bold hover:underline cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Quoted Amount: <strong>{formatCurrency(activeBooking.amountQuoted)}</strong></div>
                  <div>Received: <strong className="text-emerald-600">{formatCurrency(activeBooking.amountReceived)}</strong></div>
                  <div>Payment Mode: <strong>{activeBooking.paymentPreference}</strong></div>
                  <div>Payment Status: <strong>{activeBooking.paymentStatus}</strong></div>
                </div>

                {activeBooking.transactionRef && (
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-slate-400">UTR / Ref: </span>
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{activeBooking.transactionRef}</span>
                  </div>
                )}
              </div>

              {/* Internal Notes Section */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Internal Staff Notes (Private)
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {(activeBooking.internalNotes || []).length === 0 ? (
                    <div className="text-slate-400 italic text-xs">No internal notes yet.</div>
                  ) : (
                    (activeBooking.internalNotes || []).map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{n.author}</span>
                          <span>{formatDate(n.timestamp)}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add operational note..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddNote();
                    }}
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Status Timeline History */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Status History Timeline
                </div>

                <div className="space-y-2.5 text-xs pl-2 border-l-2 border-teal-500">
                  {(activeBooking.statusHistory || []).map((sh, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between font-bold">
                        <span>{sh.status}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{formatDate(sh.at)}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">By: {sh.by}</div>
                      {sh.note && <div className="text-[11px] text-slate-600 italic">"{sh.note}"</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Destructive Actions: Soft Delete or Restore */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                {activeBooking.isDeleted ? (
                  <>
                    <button
                      onClick={() => handleRestore(activeBooking)}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Booking</span>
                    </button>

                    {isOwner && (
                      <button
                        onClick={() => {
                          setPermanentDeleteTarget(activeBooking);
                          setDeleteConfirmationText('');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Permanently</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleSoftDelete(activeBooking)}
                    className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Move to Trash</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Manual Booking Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg">Add Manual Booking (Phone / Walk-in)</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="Patient Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Mobile Number (10 digits) *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Age</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Test or Package</label>
                <select
                  value={newTest}
                  onChange={(e) => {
                    setNewTest(e.target.value);
                    const match = PRICED_PACKAGES_MAP[e.target.value];
                    if (match) setNewAmountQuoted(String(match.price));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {TEST_DROPDOWN_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Time Slot</label>
                  <select
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {settings.timeSlots.map((ts) => (
                      <option key={ts} value={ts}>{ts}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Address / Landmark</label>
                <textarea
                  rows={2}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Village, road, landmark in Ballia (Leave blank for walk-in)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Quoted Price (₹)</label>
                  <input
                    type="number"
                    value={newAmountQuoted}
                    onChange={(e) => setNewAmountQuoted(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Assign Collector</label>
                  <input
                    type="text"
                    value={newCollector}
                    placeholder="Staff name"
                    onChange={(e) => setNewCollector(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 cursor-pointer shadow-xs"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permanent Delete Modal (Owner only) */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-300 dark:border-rose-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Permanent Deletion</h3>
              <p className="text-xs text-slate-500 mt-1">
                This action is IRREVERSIBLE. Booking {permanentDeleteTarget.id} for {permanentDeleteTarget.name} will be permanently removed from Firestore.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-900 text-xs">
              To proceed, please type <strong>DELETE</strong> below:
            </div>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-center font-bold text-sm tracking-wider"
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPermanentDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePermanentDeleteConfirm}
                disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-40 cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking SMS Confirmation Modal */}
      <BookingSmsModal
        isOpen={Boolean(smsModalBooking)}
        onClose={() => setSmsModalBooking(null)}
        booking={smsModalBooking}
        settings={settings}
      />

    </div>
  );
};
