import React, { useState, useMemo } from 'react';
import { BookingItem, ReportStatus, ReportDeliveryMode } from '../../types/admin';
import { formatDate } from '../../lib/exportUtils';
import { updateBooking } from '../../lib/adminFirestore';
import { useAdminAuth } from '../../lib/adminAuth';
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  MessageCircle,
  Printer,
  Search,
  Send,
  AlertCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface AdminReportsPageProps {
  bookings: BookingItem[];
  onSelectBooking: (booking: BookingItem) => void;
}

const ALL_REPORT_STATUSES: ReportStatus[] = ['Not Started', 'In Progress', 'Ready', 'Delivered'];

export const AdminReportsPage: React.FC<AdminReportsPageProps> = ({ bookings, onSelectBooking }) => {
  const { adminData } = useAdminAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Ready');

  const activeBookings = useMemo(() => bookings.filter((b) => !b.isDeleted), [bookings]);

  const filteredBookings = useMemo(() => {
    return activeBookings.filter((b) => {
      if (statusFilter !== 'all' && b.reportStatus !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.phone.includes(q) ||
          b.testOrPackage.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeBookings, statusFilter, searchQuery]);

  const handleUpdateReportStatus = async (
    b: BookingItem,
    newStatus: ReportStatus,
    deliveryMode?: ReportDeliveryMode
  ) => {
    if (!adminData) return;
    const updates: Partial<BookingItem> = {
      reportStatus: newStatus
    };
    if (deliveryMode) updates.reportDeliveryMode = deliveryMode;

    await updateBooking(b.id, updates, {
      name: adminData.name,
      email: adminData.email
    }, `Updated report status to "${newStatus}"`);
  };

  const getWhatsappReadyMessage = (b: BookingItem) => {
    const text = `Hello ${b.name}, your test report for ${b.testOrPackage} (Ref: ${b.id}) has been verified and is READY. You can receive the digital report through this verified chat or collect a printed physical copy at Bharat Pathology, Bhimpura No. 1, Balauli Road.`;
    return `https://wa.me/91${b.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Diagnostic Reports Dispatcher</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track clinical report preparation, dispatch verified results, and record delivery timestamps.
        </p>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-3xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200 text-xs sm:text-sm flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-teal-900 dark:text-teal-100">Patient Data Privacy Protocol:</span>
          <span>
            Diagnostic test results are delivered privately via the lab's verified WhatsApp or handed over in person.
            Never publish or host unauthenticated patient medical reports online.
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {['Ready', 'In Progress', 'Not Started', 'Delivered', 'all'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'All Reports' : st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient, test, phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

        </div>
      </div>

      {/* Reports List */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <FileCheck2 className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <div className="font-semibold text-sm">No reports currently matching "{statusFilter}".</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {b.name}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">({b.id})</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    b.reportStatus === 'Ready'
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      : b.reportStatus === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : b.reportStatus === 'In Progress'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {b.reportStatus}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Investigation: <strong>{b.testOrPackage}</strong> • Delivery: <strong>{b.reportDeliveryMode || 'WhatsApp'}</strong>
                </div>

                <div className="text-xs text-slate-500">
                  Patient Phone: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{b.phone}</span> • Date: {formatDate(b.createdAt)}
                </div>
              </div>

              {/* Status Update & Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <select
                  value={b.reportStatus}
                  onChange={(e) => handleUpdateReportStatus(b, e.target.value as ReportStatus)}
                  className="px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                >
                  {ALL_REPORT_STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>

                {b.reportStatus === 'Ready' && (
                  <a
                    href={getWhatsappReadyMessage(b)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs min-h-[40px]"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Ready Alert</span>
                  </a>
                )}

                {b.reportStatus !== 'Delivered' && (
                  <button
                    onClick={() => handleUpdateReportStatus(b, 'Delivered', 'WhatsApp')}
                    className="px-3 py-2 rounded-xl border border-emerald-300 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 text-xs font-bold cursor-pointer min-h-[40px]"
                  >
                    Mark Delivered
                  </button>
                )}

                <button
                  onClick={() => onSelectBooking(b)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  title="Open full booking drawer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
