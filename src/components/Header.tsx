import React, { useState, useEffect } from 'react';
import { Menu, X, Activity, ArrowRight } from 'lucide-react';
import { LAB_DETAILS } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useLabSettings } from '../context/LabSettingsContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const { t } = useLanguage();
  const { settings } = useLabSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = settings.labName || LAB_DETAILS.name;
  const displayTagline = settings.tagline || LAB_DETAILS.tagline;

  // Maximum 6 nav links per requirement B2
  const navLinks = [
    { id: 'catalog', label: t('Tests', 'जांच सूची'), href: '#catalog' },
    { id: 'packages', label: t('Packages', 'हेल्थ पैकेज'), href: '#packages' },
    { id: 'home-collection', label: t('Home Collection', 'होम कलेक्शन'), href: '#home-collection' },
    { id: 'reports', label: t('Reports', 'रिपोर्ट्स'), href: '#reports' },
    { id: 'service-areas', label: t('Service Areas', 'सेवा क्षेत्र'), href: '#service-areas' },
    { id: 'faq', label: t('FAQs', 'अक्सर पूछे सवाल'), href: '#faq' }
  ];

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Active section highlighting
      const sections = ['catalog', 'packages', 'home-collection', 'reports', 'service-areas', 'faq', 'contact'];
      for (const sId of sections) {
        const el = document.getElementById(sId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveSection(sId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open per requirement B2
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + href);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const goToHome = () => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBooking = () => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/#booking-form');
    } else {
      const el = document.getElementById('booking-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-200 ${
        scrolled
          ? 'bg-white/98 border-slate-200/90 shadow-sm'
          : 'bg-white/95 border-slate-200/70 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={goToHome}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition-colors">
              <Activity className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="block text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                {displayName}
              </span>
              <span className="block text-xs font-medium text-slate-500 tracking-wide">
                {displayTagline}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links (Max 6) */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-sm font-semibold transition-colors cursor-pointer py-1.5 border-b-2 ${
                    isActive
                      ? 'text-teal-700 border-teal-600 font-bold'
                      : 'text-slate-600 border-transparent hover:text-teal-700 hover:border-teal-200'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Primary Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={scrollToBooking}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-xs hover:shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              <span>{t('Request Collection', 'कलेक्शन अनुरोध')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Button (No duplicate phone/whatsapp icons in mobile header) */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer (closes on any tap, locks body scroll) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] sm:top-[80px] bottom-0 bg-slate-900/40 backdrop-blur-xs z-50">
          <div className="bg-white border-b border-slate-200 shadow-xl max-h-[85vh] overflow-y-auto px-4 pt-3 pb-6 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left px-3.5 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors cursor-pointer min-h-[44px]"
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={scrollToBooking}
                className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>{t('Request Collection', 'कलेक्शन अनुरोध')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
