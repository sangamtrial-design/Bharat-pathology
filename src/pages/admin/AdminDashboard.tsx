import React, { useMemo, useEffect, useRef, useState } from 'react';
import { BookingItem, LabSettings } from '../../types/admin';
import { formatCurrency, formatDate } from '../../lib/exportUtils';
import { playNewBookingChime } from '../../lib/soundAlert';
import { updateBookingStatus } from '../../lib/adminFirestore';
import { useAdminAuth } from '../../lib/adminAuth';
import { BookingSmsModal } from '../../components/admin/BookingSmsModal';
import {
  Inbox,
  Clock,
  Truck,
  CreditCard,
  FileCheck,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Activity,
  Calendar,
  Sparkles,
  CheckCircle2,
  Smartphone,
  Phone,
  MapPin,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

interface AdminDashboardProps {
  bookings: BookingItem[];
  settings: LabSettings;
  onSelectBooking: (booking: BookingItem) => void;
  onNavigateToTab: (tab: any) => void;
  soundEnabled: boolean;
}

const COLORS = ['#0d9488', '#0284c7', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#94a3b8'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  bookings,
  settings,
  onSelectBooking,
  onNavigateToTab,
  soundEnabled
}) => {
  const { adminData, user } = useAdminAuth();
  const [smsModalBooking, setSmsModalBooking] = useState<BookingItem | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Track previous count to chime on new incoming bookings
  const prevCountRef = useRef<number>(bookings.length);

  useEffect(() => {
    if (bookings.length > prevCountRef.current && prevCountRef.current > 0) {
      if (soundEnabled) {
        playNewBookingChime();
      }
    }
    prevCountRef.current = bookings.length;
  }, [bookings.length, soundEnabled]);

  const activeBookings = useMemo(() => bookings.filter((b) => !b.isDeleted), [bookings]);

  // Live incoming 'New' bookings that need acceptance
  const incomingNewBookings = useMemo(
    () => activeBookings.filter((b) => b.status === 'New'),
    [activeBookings]
  );

  const handleAcceptBooking = async (b: BookingItem) => {
    setAcceptingId(b.id);
    try {
      const actorName = adminData?.name || user?.email || 'Admin';
      const actorEmail = adminData?.email || user?.email || 'admin@bharatpathology.in';
      await updateBookingStatus(b, 'Confirmed', { name: actorName, email: actorEmail }, 'Accepted on Dashboard');
      // Open SMS confirmation modal for instant patient SMS
      setSmsModalBooking({
        ...b,
        status: 'Confirmed',
        confirmedDate: b.confirmedDate || b.preferredDate,
        confirmedTimeSlot: b.confirmedTimeSlot || b.timeSlot
      });
    } catch (err) {
      console.error('Failed to accept booking:', err);
    } finally {
      setAcceptingId(null);
    }
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Compute Metrics Cards
  const stats = useMemo(() => {
    let todayNew = 0;
    let pending = 0;
    let todayCollections = 0;
    let awaitingPayment = 0;
    let reportsReady = 0;
    let completedThisMonth = 0;
    let revenueThisMonth = 0;

    const currentYearMonth = todayStr.substring(0, 7);

    activeBookings.forEach((b) => {
      const createdDate = (b.createdAt || '').substring(0, 10);
      const confOrPrefDate = (b.confirmedDate || b.preferredDate || '').substring(0, 10);

      // Today's new
      if (createdDate === todayStr && b.status === 'New') {
        todayNew++;
      }

      // Pending
      if (b.status === 'New' || b.status === 'Contacted') {
        pending++;
      }

      // Today's collections
      if (confOrPrefDate === todayStr && (b.status === 'Confirmed' || b.status === 'Collector Assigned')) {
        todayCollections++;
      }

      // Awaiting payment verification
      if (b.paymentStatus === 'UPI Pending Verification') {
        awaitingPayment++;
      }

      // Reports ready to deliver
      if (b.reportStatus === 'Ready') {
        reportsReady++;
      }

      // Completed this month
      if (b.status === 'Completed' && createdDate.startsWith(currentYearMonth)) {
        completedThisMonth++;
      }

      // Revenue this month (verified payments only)
      if (b.paymentStatus === 'Paid (Verified)' && createdDate.startsWith(currentYearMonth)) {
        revenueThisMonth += Number(b.amountReceived) || Number(b.amountQuoted) || 0;
      }
    });

    return {
      todayNew,
      pending,
      todayCollections,
      awaitingPayment,
      reportsReady,
      completedThisMonth,
      revenueThisMonth
    };
  }, [activeBookings, todayStr]);

  // "Needs Attention" List
  const needsAttention = useMemo(() => {
    const items: Array<{
      booking: BookingItem;
      type: 'new_delayed' | 'payment_unverified' | 'unassigned_tomorrow' | 'report_undelivered';
      badge: string;
      message: string;
      badgeColor: string;
    }> = [];

    const nowTime = Date.now();
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

    activeBookings.forEach((b) => {
      // 1. New for more than 2 hours
      if (b.status === 'New') {
        const createdTime = new Date(b.createdAt).getTime();
        if (nowTime - createdTime > TWO_HOURS_MS) {
          items.push({
            booking: b,
            type: 'new_delayed',
            badge: '> 2h Unattended',
            message: `New request from ${b.name} (${b.phone}) needs initial contact.`,
            badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
          });
        }
      }

      // 2. UPI payments pending verification
      if (b.paymentStatus === 'UPI Pending Verification') {
        items.push({
          booking: b,
          type: 'payment_unverified',
          badge: 'Payment Check',
          message: `UPI Ref ${b.transactionRef || 'Pending'} for ₹${b.amountQuoted} requires verification.`,
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
        });
      }

      // 3. Tomorrow's collections with no collector assigned
      const targetDate = (b.confirmedDate || b.preferredDate || '').substring(0, 10);
      if (targetDate === tomorrowStr && (!b.assignedCollector || b.status === 'Confirmed')) {
        items.push({
          booking: b,
          type: 'unassigned_tomorrow',
          badge: 'Tomorrow Unassigned',
          message: `Collection tomorrow for ${b.name} (${b.testOrPackage}) has no phlebotomist assigned.`,
          badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
        });
      }

      // 4. Reports ready but not delivered
      if (b.reportStatus === 'Ready') {
        items.push({
          booking: b,
          type: 'report_undelivered',
          badge: 'Report Undelivered',
          message: `Report ready for ${b.name} (${b.testOrPackage}). Pending WhatsApp or pickup delivery.`,
          badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300'
        });
      }
    });

    return items.slice(0, 8); // Top 8 immediate attention items
  }, [activeBookings, tomorrowStr]);

  // Chart 1: 30-day Trend
  const dailyTrend = useMemo(() => {
    const daysMap: Record<string, number> = {};
    const d = new Date();
    // Build last 30 days
    for (let i = 29; i >= 0; i--) {
      const past = new Date(d);
      past.setDate(past.getDate() - i);
      const iso = past.toISOString().split('T')[0];
      daysMap[iso] = 0;
    }

    activeBookings.forEach((b) => {
      const dt = (b.createdAt || '').substring(0, 10);
      if (daysMap[dt] !== undefined) {
        daysMap[dt]++;
      }
    });

    return Object.entries(daysMap).map(([date, count]) => ({
      date: formatDate(date).slice(0, 6),
      bookings: count
    }));
  }, [activeBookings]);

  // Chart 2: Status Distribution
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    activeBookings.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [activeBookings]);

  // Chart 3: Top Requested Tests / Packages
  const topTests = useMemo(() => {
    const counts: Record<string, number> = {};
    activeBookings.forEach((b) => {
      const key = b.testOrPackage || 'Other';
      // Shorten package names for chart
      const label = key.replace(' Package - Rs ', ' (₹').replace(' Package', '');
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name: name.slice(0, 20), count }));
  }, [activeBookings]);

  // Chart 4: Payment Status Split
  const paymentSplit = useMemo(() => {
    const counts: Record<string, number> = {};
    activeBookings.forEach((b) => {
      counts[b.paymentStatus] = (counts[b.paymentStatus] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [activeBookings]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Title & Live indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Laboratory Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time operations, booking workflows, and revenue overview for Bharat Pathology.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Sync Active ({activeBookings.length} total)</span>
        </div>
      </div>

      {/* 7 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        
        {/* Card 1: Today's new */}
        <div
          onClick={() => onNavigateToTab('bookings')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's New
            </span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">{stats.todayNew}</div>
          <span className="text-[10px] text-slate-400">Fresh bookings</span>
        </div>

        {/* Card 2: Pending (New + Contacted) */}
        <div
          onClick={() => onNavigateToTab('bookings')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.pending}</div>
          <span className="text-[10px] text-slate-400">New + Contacted</span>
        </div>

        {/* Card 3: Today's collections */}
        <div
          onClick={() => onNavigateToTab('schedule')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today Visits
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.todayCollections}</div>
          <span className="text-[10px] text-slate-400">Home samples</span>
        </div>

        {/* Card 4: Awaiting Payment Verification */}
        <div
          onClick={() => onNavigateToTab('payments')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              UPI Verify
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.awaitingPayment}</div>
          <span className="text-[10px] text-slate-400">Pending check</span>
        </div>

        {/* Card 5: Reports ready */}
        <div
          onClick={() => onNavigateToTab('reports')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ready Reports
            </span>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400">{stats.reportsReady}</div>
          <span className="text-[10px] text-slate-400">Ready to dispatch</span>
        </div>

        {/* Card 6: Completed Month */}
        <div
          onClick={() => onNavigateToTab('bookings')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Done (Month)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.completedThisMonth}</div>
          <span className="text-[10px] text-slate-400">Completed tests</span>
        </div>

        {/* Card 7: Revenue Month */}
        <div
          onClick={() => onNavigateToTab('payments')}
          className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-teal-700 to-slate-900 text-white shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-teal-200 uppercase tracking-wider">
              Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-teal-300" />
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight">
            {formatCurrency(stats.revenueThisMonth)}
          </div>
          <span className="text-[10px] text-teal-200 block mt-0.5">Verified this month</span>
        </div>

      </div>

      {/* LIVE INCOMING BOOKINGS ACCEPTANCE SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-teal-200 dark:border-teal-900/60 p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              <Sparkles className="w-5 h-5 text-teal-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Live Incoming Bookings & Patient SMS Dispatch
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase">
                  {incomingNewBookings.length} New
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accept requests with 1-click and immediately dispatch booking confirmation SMS to the patient's phone or WhatsApp.
              </p>
            </div>
          </div>

          {incomingNewBookings.length > 0 && (
            <button
              onClick={() => onNavigateToTab('bookings')}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>View All in Bookings Tab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {incomingNewBookings.length === 0 ? (
          <div className="text-center py-7 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40">
            <CheckCircle2 className="w-8 h-8 text-teal-500 mx-auto mb-2 opacity-80" />
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              No pending unaccepted bookings right now
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Whenever a patient submits a test request on the website, it appears here instantly with an "Accept Booking" button.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {incomingNewBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-teal-200/80 dark:border-teal-900/80 bg-gradient-to-b from-teal-50/40 to-white dark:from-slate-900 dark:to-slate-900/90 hover:shadow-md transition-all flex flex-col justify-between gap-3 relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-bold">
                        #{b.id.slice(-6).toUpperCase()}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                        {b.name}
                      </h4>
                    </div>

                    <span className="text-[11px] font-bold text-slate-500 font-mono">
                      {b.gender}, {b.age}y
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-semibold">
                      <Activity className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{b.testOrPackage}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-mono">{b.phone}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{b.preferredDate} ({b.timeSlot || 'Morning'})</span>
                    </div>

                    {b.address && (
                      <div className="flex items-center gap-1.5 text-slate-500 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{b.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    ₹{b.amountQuoted || 0}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectBooking(b)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => handleAcceptBooking(b)}
                      disabled={acceptingId === b.id}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {acceptingId === b.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Accepting...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accept & Send SMS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Needs Attention Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Needs Immediate Attention</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actionable alerts prioritized for fast lab triage.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {needsAttention.length} urgent items
          </span>
        </div>

        {needsAttention.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div>All clear! No delayed bookings, unverified payments, or unassigned collections.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {needsAttention.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectBooking(item.booking)}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-teal-400 transition-all cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Ref: {item.booking.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                    {item.message}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Charts Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 30-Day Trend Area Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold">Booking Inflow Trend (Last 30 Days)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Volume of daily patient sample requests</p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Donut Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold mb-1">Status Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Current state across active bookings</p>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            {statusDistribution.length === 0 ? (
              <div className="text-xs text-slate-400">No active bookings</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Tests Bar Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold mb-1">Top Requested Tests & Packages</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Most popular lab orders</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTests} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={120} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Status Split (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold mb-1">Payment Status Split</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Breakdown of online UPI vs lab collections</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentSplit} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

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
