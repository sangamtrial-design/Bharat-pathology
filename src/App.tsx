import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { LabSettingsProvider } from './context/LabSettingsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { TopBar } from './components/TopBar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StickyBottomBar } from './components/StickyBottomBar';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { HomePage } from './pages/HomePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { PaymentPolicyPage } from './pages/PaymentPolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Loader2 } from 'lucide-react';

// Code-split / lazy-load the admin console so the public site stays fast
const AdminRoot = lazy(() => import('./pages/admin/AdminRoot'));

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans selection:bg-teal-100 selection:text-teal-900 pb-16 sm:pb-0">
      {/* Skip to main content accessibility link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-teal-700 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-400 font-semibold text-xs"
      >
        Skip to main content
      </a>

      {/* Urgent announcement banner if enabled by owner in settings */}
      <AnnouncementBanner />

      {/* Top info bar: address + "Open daily 8:00 AM-7:00 PM" + Language switch */}
      <TopBar />

      {/* Header: logo, nav links, Request Collection CTA */}
      <Header />

      {/* Main Content Router */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Footer */}
      <Footer />

      {/* Sticky mobile bottom bar with Call + WhatsApp buttons */}
      <StickyBottomBar />

      {/* Floating WhatsApp button on tablet/desktop */}
      <FloatingWhatsApp />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <LabSettingsProvider>
          <HashRouter>
            <Routes>
              {/* Admin Protected Console Route */}
              <Route
                path="/admin/*"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
                        <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold mb-4 shadow-lg animate-pulse">
                          BP
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                          <span>Loading Laboratory Console...</span>
                        </div>
                      </div>
                    }
                  >
                    <AdminRoot />
                  </Suspense>
                }
              />

              {/* Public Patient Website Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/payment-policy" element={<PaymentPolicyPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </HashRouter>
        </LabSettingsProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
