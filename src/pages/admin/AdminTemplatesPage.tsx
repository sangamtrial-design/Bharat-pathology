import React, { useState, useEffect } from 'react';
import { MessageTemplate, BookingItem } from '../../types/admin';
import { subscribeToTemplates, saveMessageTemplate, updateBooking } from '../../lib/adminFirestore';
import { useAdminAuth } from '../../lib/adminAuth';
import { formatDate } from '../../lib/exportUtils';
import {
  MessageSquare,
  Send,
  Plus,
  Save,
  Clock,
  User,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdminTemplatesPageProps {
  bookings: BookingItem[];
  onSelectBooking: (booking: BookingItem) => void;
}

export const AdminTemplatesPage: React.FC<AdminTemplatesPageProps> = ({ bookings, onSelectBooking }) => {
  const { adminData, isOwner } = useAdminAuth();

  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [testPatientBooking, setTestPatientBooking] = useState<BookingItem | null>(null);

  // Edit Template state
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');

  // Follow-ups queue
  const todayStr = new Date().toISOString().split('T')[0];
  const followUpsDue = bookings.filter((b) => !b.isDeleted && b.followUpDate && b.followUpDate <= todayStr);

  useEffect(() => {
    const unsub = subscribeToTemplates((tpls) => {
      setTemplates(tpls);
      if (!selectedTemplate && tpls.length > 0) {
        setSelectedTemplate(tpls[0]);
        setEditingTitle(tpls[0].title);
        setEditingContent(tpls[0].content);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (bookings.length > 0 && !testPatientBooking) {
      setTestPatientBooking(bookings[0]);
    }
  }, [bookings, testPatientBooking]);

  const handleSelectTemplate = (tpl: MessageTemplate) => {
    setSelectedTemplate(tpl);
    setEditingTitle(tpl.title);
    setEditingContent(tpl.content);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate || !adminData || !isOwner) return;
    const updated: MessageTemplate = {
      ...selectedTemplate,
      title: editingTitle.trim(),
      content: editingContent.trim()
    };
    await saveMessageTemplate(updated, { name: adminData.name, email: adminData.email });
    setSelectedTemplate(updated);
    alert('Message template saved successfully.');
  };

  // Variable replacement helper
  const interpolateMessage = (tplText: string, b?: BookingItem | null) => {
    if (!b) return tplText;
    return tplText
      .replace(/{name}/g, b.name)
      .replace(/{test}/g, b.testOrPackage)
      .replace(/{date}/g, b.confirmedDate || b.preferredDate || 'soon')
      .replace(/{time}/g, b.confirmedTimeSlot || 'scheduled slot')
      .replace(/{amount}/g, `₹${b.amountQuoted}`)
      .replace(/{collector}/g, b.assignedCollector || 'lab technician')
      .replace(/{refId}/g, b.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Communication & Follow-ups</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          WhatsApp message templates with dynamic variables and scheduled patient call reminders.
        </p>
      </div>

      {/* Follow-ups Due List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-base">Patient Follow-ups Due Today</h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            {followUpsDue.length} calls pending
          </span>
        </div>

        {followUpsDue.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-2">
            No patient follow-up calls due today. You can set follow-up dates directly on booking records.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {followUpsDue.map((b) => (
              <div
                key={b.id}
                onClick={() => onSelectBooking(b)}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-teal-400 transition-colors flex items-center justify-between gap-3 cursor-pointer"
              >
                <div>
                  <div className="font-bold text-xs">{b.name} ({b.phone})</div>
                  <div className="text-[11px] text-slate-500">{b.testOrPackage} • Ref: {b.id}</div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${b.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                  </a>
                  <a
                    href={`https://wa.me/91${b.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Templates Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Template List (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Standard Templates
          </div>

          <div className="space-y-1">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedTemplate?.id === tpl.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>{tpl.title}</div>
                <div className="text-[10px] font-normal opacity-75 truncate mt-0.5">{tpl.content}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor & Live WhatsApp Preview (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base">Edit Template: {selectedTemplate?.title}</h3>
              <p className="text-xs text-slate-400">Supported variables: {'{name}, {test}, {date}, {time}, {amount}, {collector}, {refId}'}</p>
            </div>

            {isOwner && (
              <button
                onClick={handleSaveTemplate}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Template</span>
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Template Title
            </label>
            <input
              type="text"
              disabled={!isOwner}
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Message Text Body
            </label>
            <textarea
              rows={4}
              disabled={!isOwner}
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
            />
          </div>

          {/* Live Preview with Real/Selected Booking */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Live WhatsApp Preview (Sample Patient: {testPatientBooking?.name || 'Ramesh Kumar'})
              </span>

              {testPatientBooking && (
                <a
                  href={`https://wa.me/91${testPatientBooking.phone.replace(/\D/g, '')}?text=${encodeURIComponent(interpolateMessage(editingContent, testPatientBooking))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Message</span>
                </a>
              )}
            </div>

            <p className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-sans leading-relaxed">
              {interpolateMessage(editingContent, testPatientBooking)}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
