import React, { useState, useEffect } from 'react';
import { AdminAuthProvider, useAdminAuth } from '../../lib/adminAuth';
import { AdminLayout, AdminTab } from '../../components/admin/AdminLayout';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboard } from './AdminDashboard';
import { AdminBookingsPage } from './AdminBookingsPage';
import { AdminSchedulePage } from './AdminSchedulePage';
import { AdminPaymentsPage } from './AdminPaymentsPage';
import { AdminReportsPage } from './AdminReportsPage';
import { AdminPatientsPage } from './AdminPatientsPage';
import { AdminTemplatesPage } from './AdminTemplatesPage';
import { AdminContentPage } from './AdminContentPage';
import { AdminStaffPage } from './AdminStaffPage';
import { AdminSettingsPage } from './AdminSettingsPage';
import { AdminAuditLogPage } from './AdminAuditLogPage';
import { subscribeToBookings, subscribeToSettings, DEFAULT_SETTINGS } from '../../lib/adminFirestore';
import { BookingItem, LabSettings } from '../../types/admin';
import { Loader2, Activity } from 'lucide-react';

const AdminContentInner: React.FC = () => {
  const { user, adminData, loading, accessDenied, isOwner } = useAdminAuth();

  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [settings, setSettings] = useState<LabSettings>(DEFAULT_SETTINGS);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('bp_sound_alert') !== 'false';
  });

  // Selected booking state (for drilling down from dashboard/schedule/reports to booking detail drawer)
  const [selectedBookingForDrawer, setSelectedBookingForDrawer] = useState<BookingItem | null>(null);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('bp_sound_alert', String(next));
  };

  // Ensure robots noindex meta tag is active while on admin pages
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const originalContent = robotsMeta ? robotsMeta.getAttribute('content') : null;

    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (robotsMeta) {
        if (originalContent) {
          robotsMeta.setAttribute('content', originalContent);
        } else {
          robotsMeta.parentNode?.removeChild(robotsMeta);
        }
      }
    };
  }, []);

  // Subscribe to real-time bookings & settings when authenticated
  useEffect(() => {
    if (!user || !adminData?.active) return;

    const unsubBookings = subscribeToBookings((items) => {
      setBookings(items);
    });

    const unsubSettings = subscribeToSettings((s) => {
      setSettings(s);
    });

    return () => {
      unsubBookings();
      unsubSettings();
    };
  }, [user, adminData]);

  // Loading indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold mb-4 shadow-lg animate-pulse">
          BP
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
          <span>Verifying administrator credentials...</span>
        </div>
      </div>
    );
  }

  // Not logged in or access denied
  if (!user || !adminData?.active || accessDenied) {
    return <AdminLoginPage />;
  }

  // Action to navigate from dashboard card to a booking
  const handleSelectBookingFromAnywhere = (b: BookingItem) => {
    setSelectedBookingForDrawer(b);
    setCurrentTab('bookings');
  };

  return (
    <AdminLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      soundEnabled={soundEnabled}
      onToggleSound={handleToggleSound}
    >
      {currentTab === 'dashboard' && (
        <AdminDashboard
          bookings={bookings}
          settings={settings}
          onSelectBooking={handleSelectBookingFromAnywhere}
          onNavigateToTab={setCurrentTab}
          soundEnabled={soundEnabled}
        />
      )}

      {currentTab === 'bookings' && (
        <AdminBookingsPage
          bookings={bookings}
          settings={settings}
          selectedBookingDetail={selectedBookingForDrawer}
          onClearSelectedBookingDetail={() => setSelectedBookingForDrawer(null)}
        />
      )}

      {currentTab === 'schedule' && (
        <AdminSchedulePage
          bookings={bookings}
          settings={settings}
          onSelectBooking={handleSelectBookingFromAnywhere}
        />
      )}

      {currentTab === 'payments' && (
        <AdminPaymentsPage bookings={bookings} settings={settings} />
      )}

      {currentTab === 'reports' && (
        <AdminReportsPage
          bookings={bookings}
          onSelectBooking={handleSelectBookingFromAnywhere}
        />
      )}

      {currentTab === 'patients' && (
        <AdminPatientsPage
          bookings={bookings}
          onSelectBooking={handleSelectBookingFromAnywhere}
        />
      )}

      {currentTab === 'templates' && (
        <AdminTemplatesPage
          bookings={bookings}
          onSelectBooking={handleSelectBookingFromAnywhere}
        />
      )}

      {/* Owner-Only Tabs */}
      {currentTab === 'content' && isOwner && <AdminContentPage settings={settings} />}

      {currentTab === 'staff' && isOwner && <AdminStaffPage />}

      {currentTab === 'settings' && isOwner && <AdminSettingsPage settings={settings} bookings={bookings} />}

      {currentTab === 'audit' && isOwner && <AdminAuditLogPage />}
    </AdminLayout>
  );
};

export const AdminRoot: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminContentInner />
    </AdminAuthProvider>
  );
};

export default AdminRoot;
