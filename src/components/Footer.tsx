import React from 'react';
import { ArrowUp, Phone, MessageCircle, MapPin, Clock, Activity, ExternalLink, Navigation } from 'lucide-react';
import { LAB_DETAILS } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useLabSettings } from '../context/LabSettingsContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { settings, telLink, whatsappUrl } = useLabSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = settings.labName || LAB_DETAILS.name;
  const displayTagline = settings.tagline || LAB_DETAILS.tagline;
  const displayPhone = settings.phone || LAB_DETAILS.phoneDisplay;
  const displayAddress = settings.address || LAB_DETAILS.address;
  const displayHours = settings.hours || LAB_DETAILS.hours;
  const serviceAreas = settings.serviceAreas || [];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHashLink = (hash: string) => {
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 sm:pb-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight block">
                  {displayName}
                </span>
                <span className="text-xs text-teal-400 font-medium">
                  {displayTagline}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              {t(LAB_DETAILS.footerText, LAB_DETAILS.hindiFooterText)}
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <a
                href={telLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors min-h-[44px]"
              >
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>{displayPhone}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-800/60 transition-colors min-h-[44px]"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {t('Quick Links', 'त्वरित लिंक')}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => handleHashLink('#catalog')}
                  className="hover:text-teal-400 transition-colors cursor-pointer text-left py-1"
                >
                  {t('Test Catalogue', 'जांच सूची')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleHashLink('#packages')}
                  className="hover:text-teal-400 transition-colors cursor-pointer text-left py-1"
                >
                  {t('Health Packages', 'हेल्थ पैकेज')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleHashLink('#home-collection')}
                  className="hover:text-teal-400 transition-colors cursor-pointer text-left py-1"
                >
                  {t('Home Collection', 'होम कलेक्शन')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleHashLink('#reports')}
                  className="hover:text-teal-400 transition-colors cursor-pointer text-left py-1"
                >
                  {t('Reports', 'रिपोर्ट्स')}
                </button>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-teal-400 transition-colors block py-1"
                >
                  {t('Privacy Policy', 'गोपनीयता नीति')}
                </Link>
              </li>
              <li>
                <Link
                  to="/payment-policy"
                  className="hover:text-teal-400 transition-colors block py-1"
                >
                  {t('Payment Policy', 'भुगतान नीति')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas Snippet (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {t('Service Areas', 'सेवा क्षेत्र')}
            </h4>
            <div className="text-xs text-slate-400 space-y-1.5">
              {serviceAreas.length > 0 ? (
                serviceAreas.slice(0, 5).map((area, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    <span>{area}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">
                  {t('Bhimpura No. 1 and surrounding Ballia localities', 'भीमपुरा नं. 1 एवं आसपास के क्षेत्र')}
                </p>
              )}
              <button
                onClick={() => handleHashLink('#service-areas')}
                className="text-teal-400 hover:text-teal-300 text-xs font-semibold cursor-pointer pt-1 block"
              >
                {t('View all areas →', 'सभी क्षेत्र देखें →')}
              </button>
            </div>
          </div>

          {/* Address, Hours & Map Link (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t('Location & Hours', 'स्थान एवं समय')}
            </h4>
            
            <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>{displayAddress}</span>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{displayHours}</span>
            </div>

            {/* Get directions & Map link per Requirement B4 */}
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={LAB_DETAILS.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700 transition-colors w-fit min-h-[44px]"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t('Get Directions', 'रास्ता देखें (मैप्स)')}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar with copyright & back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>{LAB_DETAILS.copyright}. </span>
            <span>{t('All rights reserved.', 'सर्वाधिकार सुरक्षित।')}</span>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 min-h-[44px]"
          >
            <span>{t('Back to top', 'शीर्ष पर जाएं')}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
