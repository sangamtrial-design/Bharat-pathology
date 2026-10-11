import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../lib/adminAuth';
import {
  LayoutDashboard,
  CalendarDays,
  FileCheck2,
  Users,
  CreditCard,
  MessageSquare,
  FileText,
  Settings,
  ShieldAlert,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Activity,
  ArrowLeft,
  Volume2,
  VolumeX,
  ExternalLink,
  ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';

export type AdminTab =
  | 'dashboard'
  | 'bookings'
  | 'schedule'
  | 'payments'
  | 'reports'
  | 'patients'
  | 'templates'
  | 'content'
  | 'staff'
  | 'settings'
  | 'audit';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  children,
  soundEnabled,
  onToggleSound
}) => {
  const { adminData, isOwner, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('bp_admin_theme') === 'dark';
  });

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bp_admin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bp_admin_theme', 'light');
    }
  }, [darkMode]);

  // Set noindex meta tag dynamically
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';

    return () => {
      if (meta) meta.content = 'index, follow';
    };
  }, []);

  const navItems: Array<{ id: AdminTab; label: string; icon: any; ownerOnly?: boolean }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: ClipboardList },
    { id: 'schedule', label: 'Schedule & Routes', icon: CalendarDays },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports Tracker', icon: FileCheck2 },
    { id: 'patients', label: 'Patient Directory', icon: Users },
    { id: 'templates', label: 'Messages & Follow-up', icon: MessageSquare },
    { id: 'content', label: 'Content CMS', icon: FileText, ownerOnly: true },
    { id: 'staff', label: 'Staff Management', icon: ShieldAlert, ownerOnly: true },
    { id: 'settings', label: 'Lab Settings', icon: Settings, ownerOnly: true },
    { id: 'audit', label: 'Audit Trail', icon: Activity, ownerOnly: true }
  ];

  const handleSelectTab = (tab: AdminTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'} flex flex-col`}>
      
      {/* Top Header Bar */}
      <header className={`sticky top-0 z-40 border-b ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'} backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between shadow-xs`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
              BP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight leading-tight">
                  Bharat Pathology
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                  Lab Ops
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                Bhimpura No. 1, Ballia
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Alert Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ${
              soundEnabled
                ? 'text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-300'
                : 'text-slate-400 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
            }`}
            title={soundEnabled ? 'Chime on new booking (Enabled)' : 'Chime muted'}
            aria-label="Toggle sound alerts"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
            title="Toggle color theme"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right">
              <div className="text-xs font-bold leading-tight">{adminData?.name || 'Administrator'}</div>
              <div className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-bold tracking-wider">
                {adminData?.role}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold border border-rose-200 dark:border-rose-900/60 cursor-pointer transition-colors min-h-[40px]"
            title="Sign out of Admin Panel"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Public Site Link */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="View public website (opens in new tab)"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Shell: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col w-64 border-r ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shrink-0`}>
          <div className="p-4 space-y-1 overflow-y-auto flex-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Operations
            </div>

            {navItems.map((item) => {
              if (item.ownerOnly && !isOwner) return null;
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left min-h-[44px] ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.ownerOnly && (
                    <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                      Owner
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className={`p-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'} text-[11px] text-slate-400 space-y-1`}>
            <div>Logged in as: <span className="font-semibold text-slate-600 dark:text-slate-300">{adminData?.email}</span></div>
            <div className="text-[10px] text-slate-400">Auto-logout: 30m idle</div>
          </div>
        </aside>

        {/* Mobile Full Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
            <div className={`w-4/5 max-w-xs ${darkMode ? 'bg-slate-900' : 'bg-white'} h-full flex flex-col p-4 shadow-2xl`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-2">
                <div className="font-bold text-sm">Lab Operations Menu</div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 py-2">
                {navItems.map((item) => {
                  if (item.ownerOnly && !isOwner) return null;
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-left min-h-[44px] ${
                        isActive
                          ? 'bg-teal-600 text-white font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-bold text-sm cursor-pointer min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
          </div>
        )}

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-24 sm:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

      </div>

      {/* Mobile Sticky Bottom Navigation (5 quick taps) */}
      <nav aria-label="Admin mobile navigation" className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'} backdrop-blur-md px-2 py-1.5 safe-area-pb shadow-lg`}>
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => handleSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg cursor-pointer min-h-[44px] ${
              currentTab === 'dashboard' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          <button
            onClick={() => handleSelectTab('bookings')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg cursor-pointer min-h-[44px] ${
              currentTab === 'bookings' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Bookings</span>
          </button>

          <button
            onClick={() => handleSelectTab('schedule')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg cursor-pointer min-h-[44px] ${
              currentTab === 'schedule' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Routes</span>
          </button>

          <button
            onClick={() => handleSelectTab('payments')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg cursor-pointer min-h-[44px] ${
              currentTab === 'payments' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Payments</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer min-h-[44px]"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">More</span>
          </button>
        </div>
      </nav>

    </div>
  );
};
