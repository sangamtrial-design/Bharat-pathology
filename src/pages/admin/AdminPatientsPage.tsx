import React, { useState, useMemo } from 'react';
import { BookingItem, PatientRecord } from '../../types/admin';
import { formatDate, formatCurrency, maskPhone } from '../../lib/exportUtils';
import {
  Users,
  Search,
  Phone,
  Calendar,
  FileText,
  ChevronRight,
  Download,
  X,
  History,
  Activity
} from 'lucide-react';

interface AdminPatientsPageProps {
  bookings: BookingItem[];
  onSelectBooking: (booking: BookingItem) => void;
}

export const AdminPatientsPage: React.FC<AdminPatientsPageProps> = ({ bookings, onSelectBooking }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  // Group active bookings by phone number
  const patientDirectory = useMemo(() => {
    const map: Record<string, PatientRecord> = {};

    bookings
      .filter((b) => !b.isDeleted)
      .forEach((b) => {
        const cleanPhone = b.phone.replace(/\D/g, '') || b.phone;
        if (!map[cleanPhone]) {
          map[cleanPhone] = {
            phone: b.phone,
            name: b.name,
            age: b.age,
            gender: b.gender,
            address: b.address,
            totalBookings: 0,
            lastVisit: b.createdAt,
            latestStatus: b.status,
            bookings: []
          };
        }

        map[cleanPhone].totalBookings++;
        map[cleanPhone].bookings.push(b);

        // Keep most recent metadata
        if (new Date(b.createdAt) > new Date(map[cleanPhone].lastVisit)) {
          map[cleanPhone].lastVisit = b.createdAt;
          map[cleanPhone].latestStatus = b.status;
          map[cleanPhone].name = b.name;
          map[cleanPhone].age = b.age;
          map[cleanPhone].gender = b.gender;
          map[cleanPhone].address = b.address;
        }
      });

    return Object.values(map).sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
  }, [bookings]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patientDirectory;
    const q = searchQuery.toLowerCase();
    return patientDirectory.filter(
      (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.address.toLowerCase().includes(q)
    );
  }, [patientDirectory, searchQuery]);

  // Export Patients to CSV
  const handleExportPatients = () => {
    const headers = ['Patient Name', 'Phone', 'Gender', 'Age', 'Total Bookings', 'Last Visit', 'Address'];
    const rows = filteredPatients.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.phone}"`,
      `"${p.gender}"`,
      p.age,
      p.totalBookings,
      `"${formatDate(p.lastVisit)}"`,
      `"${p.address.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bharat_Pathology_Patients_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Patient Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aggregated patient profiles and historical diagnostic records grouped by mobile number.
          </p>
        </div>

        <button
          onClick={handleExportPatients}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold hover:bg-slate-50 cursor-pointer self-start sm:self-auto min-h-[40px]"
        >
          <Download className="w-4 h-4" />
          <span>Export Directory (CSV)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients by name, mobile number, or village/locality..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Directory Grid */}
      {filteredPatients.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <div className="font-semibold text-sm">No patient profiles found.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((p) => (
            <div
              key={p.phone}
              onClick={() => setSelectedPatient(p)}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-teal-400 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                      {p.name}
                    </h3>
                    <div className="text-xs text-slate-500 font-mono">{p.phone}</div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold shrink-0">
                    {p.totalBookings} visit{p.totalBookings > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>Age / Gender: <strong>{p.age} yrs, {p.gender}</strong></div>
                  <div className="line-clamp-2">Address: <strong>{p.address}</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Last visit: {formatDate(p.lastVisit)}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Profile & Booking History Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                <div className="text-xs text-slate-500 font-mono mt-0.5">{selectedPatient.phone} • {selectedPatient.gender}, {selectedPatient.age}y</div>
              </div>

              <button onClick={() => setSelectedPatient(null)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <span className="text-slate-400 block font-medium">Primary Address:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedPatient.address}</p>
            </div>

            {/* Past Bookings Timeline */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-sm">Diagnostic Test History ({selectedPatient.bookings.length})</h3>
              </div>

              <div className="space-y-2.5">
                {selectedPatient.bookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedPatient(null);
                      onSelectBooking(b);
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 transition-colors cursor-pointer text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{b.testOrPackage}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Date: {formatDate(b.createdAt)} • Amount: {formatCurrency(b.amountQuoted)}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
