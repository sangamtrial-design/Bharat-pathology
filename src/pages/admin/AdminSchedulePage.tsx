import React, { useState, useMemo } from 'react';
import { BookingItem, LabSettings } from '../../types/admin';
import { formatDate, printRouteSheet } from '../../lib/exportUtils';
import { updateLabSettings } from '../../lib/adminFirestore';
import { useAdminAuth } from '../../lib/adminAuth';
import {
  CalendarDays,
  Truck,
  Printer,
  MapPin,
  Clock,
  User,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdminSchedulePageProps {
  bookings: BookingItem[];
  settings: LabSettings;
  onSelectBooking: (booking: BookingItem) => void;
}

export const AdminSchedulePage: React.FC<AdminSchedulePageProps> = ({
  bookings,
  settings,
  onSelectBooking
}) => {
  const { adminData, isOwner } = useAdminAuth();

  const [activeSubTab, setActiveSubTab] = useState<'routes' | 'calendar' | 'capacity'>('routes');
  const [selectedRouteDate, setSelectedRouteDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Calendar view mode
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Capacity management state
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newSlotInput, setNewSlotInput] = useState('');

  const activeBookings = useMemo(() => bookings.filter((b) => !b.isDeleted), [bookings]);

  // Route Sheet for Selected Date
  const routeBookings = useMemo(() => {
    return activeBookings.filter((b) => {
      const d = (b.confirmedDate || b.preferredDate || '').substring(0, 10);
      return d === selectedRouteDate;
    });
  }, [activeBookings, selectedRouteDate]);

  // Grouped by collector
  const groupedByCollector = useMemo(() => {
    const map: Record<string, BookingItem[]> = {};
    routeBookings.forEach((b) => {
      const c = b.assignedCollector?.trim() || 'Unassigned Phlebotomists';
      if (!map[c]) map[c] = [];
      map[c].push(b);
    });
    return map;
  }, [routeBookings]);

  // Handlers for capacity & holidays
  const handleAddBlockedDate = async () => {
    if (!newBlockedDate || !adminData || !isOwner) return;
    if (settings.blockedDates.includes(newBlockedDate)) return;

    const updated = [...(settings.blockedDates || []), newBlockedDate];
    await updateLabSettings({ ...settings, blockedDates: updated }, {
      name: adminData.name,
      email: adminData.email
    });
    setNewBlockedDate('');
  };

  const handleRemoveBlockedDate = async (dt: string) => {
    if (!adminData || !isOwner) return;
    const updated = settings.blockedDates.filter((d) => d !== dt);
    await updateLabSettings({ ...settings, blockedDates: updated }, {
      name: adminData.name,
      email: adminData.email
    });
  };

  const handleAddSlot = async () => {
    if (!newSlotInput.trim() || !adminData || !isOwner) return;
    const updated = [...(settings.timeSlots || []), newSlotInput.trim()];
    await updateLabSettings({ ...settings, timeSlots: updated }, {
      name: adminData.name,
      email: adminData.email
    });
    setNewSlotInput('');
  };

  const handleRemoveSlot = async (slot: string) => {
    if (!adminData || !isOwner) return;
    const updated = settings.timeSlots.filter((s) => s !== slot);
    await updateLabSettings({ ...settings, timeSlots: updated }, {
      name: adminData.name,
      email: adminData.email
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Schedule & Phlebotomy Routes</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dispatch routes, manage time slots, and schedule home sample visits across Ballia.
          </p>
        </div>

        {/* View Toggle */}
        <div className="p-1 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('routes')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              activeSubTab === 'routes' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Today's Route Sheet
          </button>
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              activeSubTab === 'calendar' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveSubTab('capacity')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              activeSubTab === 'capacity' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Slots & Holidays
          </button>
        </div>
      </div>

      {/* Subtab 1: Today's Route Sheet */}
      {activeSubTab === 'routes' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-teal-600" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Route Date:
              </label>
              <input
                type="date"
                value={selectedRouteDate}
                onChange={(e) => setSelectedRouteDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <button
              onClick={() => printRouteSheet(selectedRouteDate, routeBookings, settings)}
              disabled={routeBookings.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs cursor-pointer min-h-[40px]"
            >
              <Printer className="w-4 h-4" />
              <span>Print Route Manifest ({routeBookings.length})</span>
            </button>
          </div>

          {routeBookings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <Truck className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <div className="font-semibold text-sm">No sample collections scheduled for {formatDate(selectedRouteDate)}.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.keys(groupedByCollector).map((collector) => {
                const list = groupedByCollector[collector];

                return (
                  <div
                    key={collector}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
                  >
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-teal-600" />
                        <span className="font-bold text-sm">{collector}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold">
                          {list.length} stop{list.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {list.map((b, idx) => (
                        <div
                          key={b.id}
                          onClick={() => onSelectBooking(b)}
                          className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 font-bold text-xs flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-sm">{b.name}</span>
                              <span className="text-xs text-slate-400 font-mono">({b.phone})</span>
                              {b.priority === 'Urgent' && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                                  URGENT
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-slate-600 dark:text-slate-300 pl-8">
                              <strong>Slot:</strong> {b.confirmedTimeSlot || 'Unspecified'} • <strong>Test:</strong> {b.testOrPackage}
                            </div>

                            <div className="text-xs text-slate-500 pl-8 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="line-clamp-1">{b.address}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pl-8 md:pl-0 shrink-0">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Navigate</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Calendar View */}
      {activeSubTab === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">Collections Calendar</h3>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="month"
                value={currentCalendarMonth}
                onChange={(e) => setCurrentCalendarMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
              />
            </div>
          </div>

          {/* Simple list of days in selected month with booking count */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = String(i + 1).padStart(2, '0');
              const fullDate = `${currentCalendarMonth}-${dayNum}`;
              const dayBookings = activeBookings.filter((b) => {
                const d = (b.confirmedDate || b.preferredDate || '').substring(0, 10);
                return d === fullDate;
              });

              const isBlocked = settings.blockedDates.includes(fullDate);

              return (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedRouteDate(fullDate);
                    setActiveSubTab('routes');
                  }}
                  className={`p-3 rounded-2xl border text-xs min-h-[90px] flex flex-col justify-between transition-all cursor-pointer ${
                    isBlocked
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-700'
                      : dayBookings.length > 0
                      ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800 hover:border-teal-400'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span>Day {i + 1}</span>
                    {isBlocked && <span className="text-[9px] uppercase text-rose-500">Holiday</span>}
                  </div>

                  {dayBookings.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-extrabold text-teal-700 dark:text-teal-300 block">
                        {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">
                        {dayBookings.map((b) => b.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 3: Slots & Capacity Configuration */}
      {activeSubTab === 'capacity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Time Slots */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-base">Phlebotomy Time Slots</h3>
              <p className="text-xs text-slate-500">Configured slots shown during booking triage and route dispatching.</p>
            </div>

            <div className="space-y-2">
              {settings.timeSlots.map((slot) => (
                <div
                  key={slot}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <span className="font-bold">{slot}</span>
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveSlot(slot)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isOwner && (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newSlotInput}
                  onChange={(e) => setNewSlotInput(e.target.value)}
                  placeholder="e.g. 07:00 AM - 08:30 AM"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs"
                />
                <button
                  onClick={handleAddSlot}
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs cursor-pointer hover:bg-teal-700"
                >
                  Add Slot
                </button>
              </div>
            )}
          </div>

          {/* Blocked Dates / Holidays */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-base">Blocked Dates & Lab Holidays</h3>
              <p className="text-xs text-slate-500">Days when home sample collection is suspended or fully booked.</p>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(settings.blockedDates || []).length === 0 ? (
                <div className="text-xs text-slate-400 italic">No blocked dates. Lab is open daily 8:00 AM to 7:00 PM.</div>
              ) : (
                settings.blockedDates.map((dt) => (
                  <div
                    key={dt}
                    className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-rose-800 dark:text-rose-300">{formatDate(dt)} ({dt})</span>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveBlockedDate(dt)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {isOwner && (
              <div className="flex gap-2 pt-2">
                <input
                  type="date"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
                <button
                  onClick={handleAddBlockedDate}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer hover:bg-rose-700"
                >
                  Block Date
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
