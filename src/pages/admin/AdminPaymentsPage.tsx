import React, { useState, useMemo } from 'react';
import { BookingItem, LabSettings } from '../../types/admin';
import { formatCurrency, formatDate, printBookingReceipt } from '../../lib/exportUtils';
import { verifyUPIPayment, markPaymentMismatch, refundOrAdjustPayment } from '../../lib/adminFirestore';
import { useAdminAuth } from '../../lib/adminAuth';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Printer,
  Search,
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react';

interface AdminPaymentsPageProps {
  bookings: BookingItem[];
  settings: LabSettings;
}

export const AdminPaymentsPage: React.FC<AdminPaymentsPageProps> = ({ bookings, settings }) => {
  const { adminData } = useAdminAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'verified' | 'mismatch'>('pending');

  // Modal actions
  const [mismatchTarget, setMismatchTarget] = useState<BookingItem | null>(null);
  const [mismatchReason, setMismatchReason] = useState('');

  const [refundTarget, setRefundTarget] = useState<BookingItem | null>(null);
  const [refundType, setRefundType] = useState<'Refunded' | 'Adjusted'>('Refunded');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  // Find duplicate transaction references across all active bookings
  const duplicateUtrMap = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => {
      if (b.transactionRef && b.transactionRef.trim()) {
        const utr = b.transactionRef.trim().toUpperCase();
        counts[utr] = (counts[utr] || 0) + 1;
      }
    });
    return counts;
  }, [bookings]);

  // UPI verification queue & ledger
  const activeBookings = useMemo(() => bookings.filter((b) => !b.isDeleted), [bookings]);

  const filteredItems = useMemo(() => {
    return activeBookings.filter((b) => {
      if (filterMode === 'pending' && b.paymentStatus !== 'UPI Pending Verification') return false;
      if (filterMode === 'verified' && b.paymentStatus !== 'Paid (Verified)') return false;
      if (filterMode === 'mismatch' && b.paymentStatus !== 'Amount Mismatch') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesPhone = b.phone.includes(q);
        const matchesUtr = (b.transactionRef || '').toLowerCase().includes(q);
        const matchesId = b.id.toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesUtr || matchesId;
      }
      return true;
    });
  }, [activeBookings, filterMode, searchQuery]);

  // Financial summary
  const totals = useMemo(() => {
    let verifiedTotal = 0;
    let pendingVerificationTotal = 0;
    let labDirectTotal = 0;

    activeBookings.forEach((b) => {
      if (b.paymentStatus === 'Paid (Verified)') {
        verifiedTotal += Number(b.amountReceived) || Number(b.amountQuoted) || 0;
      } else if (b.paymentStatus === 'UPI Pending Verification') {
        pendingVerificationTotal += Number(b.amountQuoted) || 0;
      } else if (b.paymentStatus === 'Pay at Lab') {
        labDirectTotal += Number(b.amountQuoted) || 0;
      }
    });

    return { verifiedTotal, pendingVerificationTotal, labDirectTotal };
  }, [activeBookings]);

  const handleVerify = async (b: BookingItem) => {
    if (!adminData) return;
    const amount = Number(b.amountQuoted) || 0;
    if (confirm(`Confirm receipt of ₹${amount} for ${b.name} (Ref: ${b.transactionRef})?`)) {
      await verifyUPIPayment(b, amount, { name: adminData.name, email: adminData.email });
    }
  };

  const handleConfirmMismatch = async () => {
    if (!mismatchTarget || !adminData || !mismatchReason.trim()) return;
    await markPaymentMismatch(mismatchTarget, mismatchReason.trim(), {
      name: adminData.name,
      email: adminData.email
    });
    setMismatchTarget(null);
    setMismatchReason('');
  };

  const handleConfirmRefund = async () => {
    if (!refundTarget || !adminData || !refundAmount || !refundReason.trim()) return;
    await refundOrAdjustPayment(
      refundTarget,
      refundType,
      Number(refundAmount),
      refundReason.trim(),
      { name: adminData.name, email: adminData.email }
    );
    setRefundTarget(null);
    setRefundAmount('');
    setRefundReason('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Payments & UPI Verification</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Reconcile direct UPI transactions, verify UTR references, and audit revenue collections.
          </p>
        </div>
      </div>

      {/* Prominent Verification Rule Callout */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3.5">
        <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-amber-900 dark:text-amber-100 text-sm mb-0.5">
            Manual Payee Name Reminder:
          </div>
          <div>
            Verify that incoming UPI transactions were received under <strong>{settings.upiPayeeName || 'Sanjay Kumar'}</strong> ({settings.upiId || 'sanjaykumar.bp@upi'}).
            Confirm the 12-digit UTR in your bank ledger before marking transactions as <strong>Verified</strong>.
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified UPI Received</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{formatCurrency(totals.verifiedTotal)}</div>
          <span className="text-[11px] text-slate-400">Total credited to lab</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending UPI Verification</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{formatCurrency(totals.pendingVerificationTotal)}</div>
          <span className="text-[11px] text-slate-400">Awaiting UTR audit</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pay At Lab Scheduled</span>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{formatCurrency(totals.labDirectTotal)}</div>
          <span className="text-[11px] text-slate-400">Payable during collection</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {[
              { id: 'pending', label: 'Pending Verification' },
              { id: 'verified', label: 'Verified Paid' },
              { id: 'mismatch', label: 'Amount Mismatch' },
              { id: 'all', label: 'All Payments' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-colors ${
                  filterMode === tab.id
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient, UTR, phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

        </div>
      </div>

      {/* Verification Queue / Ledger */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <div className="font-semibold text-sm">No payment records found under this filter.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((b) => {
            const utrClean = (b.transactionRef || '').trim().toUpperCase();
            const isDuplicateUtr = utrClean && duplicateUtrMap[utrClean] > 1;
            const isPending = b.paymentStatus === 'UPI Pending Verification';

            return (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {b.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">({b.id})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.paymentStatus === 'Paid (Verified)'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : b.paymentStatus === 'Amount Mismatch'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {b.paymentStatus}
                    </span>

                    {isDuplicateUtr && (
                      <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Duplicate UTR Alert</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Test: <strong>{b.testOrPackage}</strong> • Phone: <span className="font-mono">{b.phone}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>Expected: <strong className="text-teal-700 dark:text-teal-400">{formatCurrency(b.amountQuoted)}</strong></div>
                    <div>Paid: <strong>{formatCurrency(b.amountReceived)}</strong></div>
                    <div>Date: <span>{formatDate(b.createdAt)}</span></div>
                  </div>

                  {b.transactionRef && (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Submitted UTR / Ref:</span>
                      <span className="font-mono font-bold text-teal-700 dark:text-teal-300 select-all">
                        {b.transactionRef}
                      </span>
                    </div>
                  )}

                  {b.paymentNotes && (
                    <div className="text-[11px] text-slate-500 italic">
                      Notes: {b.paymentNotes}
                    </div>
                  )}
                </div>

                {/* Verification Actions */}
                <div className="flex flex-wrap items-center gap-2 md:self-center shrink-0">
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleVerify(b)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 min-h-[40px]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify Paid</span>
                      </button>

                      <button
                        onClick={() => {
                          setMismatchTarget(b);
                          setMismatchReason('');
                        }}
                        className="px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 font-bold text-xs cursor-pointer min-h-[40px]"
                      >
                        Mark Mismatch
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setRefundTarget(b);
                      setRefundAmount(String(b.amountReceived || b.amountQuoted || '0'));
                      setRefundReason('');
                    }}
                    className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold cursor-pointer min-h-[40px]"
                  >
                    Refund / Adjust
                  </button>

                  <button
                    onClick={() => printBookingReceipt(b, settings)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs cursor-pointer min-h-[40px]"
                    title="Print Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mismatch Modal */}
      {mismatchTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base">Flag Payment Mismatch for {mismatchTarget.name}</h3>
            <p className="text-xs text-slate-500">
              Provide reason for discrepancy (e.g. invalid UTR, lower amount transferred, or name mismatch).
            </p>

            <textarea
              rows={3}
              value={mismatchReason}
              onChange={(e) => setMismatchReason(e.target.value)}
              placeholder="e.g. UTR not found on statement or transferred ₹500 instead of ₹1099"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setMismatchTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMismatch}
                disabled={!mismatchReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-40 cursor-pointer"
              >
                Flag Mismatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund / Adjust Modal */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base">Process Refund / Adjustment</h3>

            <div className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Adjustment Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRefundType('Refunded')}
                    className={`flex-1 py-2 rounded-xl border font-bold ${
                      refundType === 'Refunded' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-300'
                    }`}
                  >
                    Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundType('Adjusted')}
                    className={`flex-1 py-2 rounded-xl border font-bold ${
                      refundType === 'Adjusted' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'border-slate-300'
                    }`}
                  >
                    Adjustment / Credit
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Reason / Banking Reference *</label>
                <textarea
                  rows={2}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Reason for adjustment and bank ref..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRefundTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRefund}
                disabled={!refundAmount || !refundReason.trim()}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 disabled:opacity-40 cursor-pointer"
              >
                Record {refundType}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
