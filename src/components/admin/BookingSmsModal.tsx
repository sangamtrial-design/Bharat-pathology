import React, { useState, useEffect } from 'react';
import { BookingItem, LabSettings } from '../../types/admin';
import {
  buildConfirmationSMS,
  getSMSHref,
  getWhatsAppHref
} from '../../lib/adminFirestore';
import {
  MessageSquare,
  Smartphone,
  Send,
  Copy,
  Check,
  X,
  Phone,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface BookingSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingItem | null;
  settings: LabSettings;
  onBookingAccepted?: (booking: BookingItem) => void;
}

export const BookingSmsModal: React.FC<BookingSmsModalProps> = ({
  isOpen,
  onClose,
  booking,
  settings,
  onBookingAccepted
}) => {
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [apiSending, setApiSending] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false);

  useEffect(() => {
    if (booking) {
      const generated = buildConfirmationSMS(booking, settings);
      setCustomMessage(generated);
      setCopied(false);
      setApiSuccess(false);
    }
  }, [booking, settings]);

  if (!isOpen || !booking) return null;

  const smsLink = getSMSHref(booking.phone, customMessage);
  const waLink = getWhatsAppHref(booking.phone, customMessage);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSendWebhook = async () => {
    if (!settings.smsGatewayUrl) return;
    setApiSending(true);
    try {
      await fetch(settings.smsGatewayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: booking.phone,
          message: customMessage,
          bookingId: booking.id,
          patientName: booking.name
        })
      });
      setApiSuccess(true);
    } catch (e) {
      console.warn('SMS Webhook call failed:', e);
      // Fallback
    } finally {
      setApiSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-600 via-teal-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs text-white">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3 h-3" /> Booking Accepted & Confirmed
              </div>
              <h3 className="text-base sm:text-lg font-bold leading-tight">
                Send Confirmation SMS to Patient
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Patient summary badge */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                {booking.name}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                📱 {booking.phone} • {booking.gender}, {booking.age} yrs
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 block">
                {booking.testOrPackage}
              </span>
              <span className="text-[11px] text-slate-500">
                Ref: #{booking.id.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>

          {/* SMS Message Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-teal-600" />
                <span>Personalized SMS Text Content:</span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </button>
            </div>

            <textarea
              rows={7}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-y"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Includes patient name, test, date, time slot, fee, and lab helpline. You can edit this text before dispatching.
            </p>
          </div>

          {/* Dispatch Options Grid */}
          <div className="pt-1 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              1-Click Instant Dispatch Options:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Option 1: Native Phone SMS */}
              <a
                href={smsLink}
                onClick={() => {
                  if (onBookingAccepted) onBookingAccepted(booking);
                }}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer text-center group"
              >
                <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Send via Phone SMS (Direct)</span>
              </a>

              {/* Option 2: WhatsApp */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (onBookingAccepted) onBookingAccepted(booking);
                }}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer text-center group"
              >
                <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Send via WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

            </div>

            {/* Option 3: Copy only & Webhook */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Text Only'}</span>
              </button>

              {settings.smsGatewayUrl && (
                <button
                  type="button"
                  disabled={apiSending}
                  onClick={handleSendWebhook}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-teal-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{apiSending ? 'Dispatching...' : apiSuccess ? 'Dispatched via Gateway!' : 'Trigger SMS Webhook'}</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Booking saved as Confirmed with verified audit entry</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
          >
            Done / Close
          </button>
        </div>

      </div>
    </div>
  );
};
