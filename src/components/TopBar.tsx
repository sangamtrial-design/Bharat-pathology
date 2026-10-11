import React from 'react';
import { MapPin, Clock, Phone, Globe } from 'lucide-react';
import { LAB_DETAILS } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useLabSettings } from '../context/LabSettingsContext';

export const TopBar: React.FC = () => {
  const { lang, toggleLang, t } = useLanguage();
  const { settings, telLink } = useLabSettings();

  const displayAddress = settings.address || LAB_DETAILS.address;
  const displayHours = settings.hours || LAB_DETAILS.hours;
  const displayPhone = settings.phone || LAB_DETAILS.phoneDisplay;

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-2 px-3 sm:px-6 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Address and Hours */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate max-w-[280px] sm:max-w-none">
              {displayAddress}
            </span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{displayHours}</span>
          </div>
        </div>

        {/* Right: Phone & Language switch */}
        <div className="flex items-center gap-3 ml-auto">
          <a
            href={telLink}
            className="hidden sm:inline-flex items-center gap-1.5 text-teal-300 hover:text-white transition-colors font-medium"
            title="Call Bharat Pathology"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{displayPhone}</span>
          </a>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-xs font-semibold cursor-pointer"
            aria-label="Toggle language between English and Hindi"
          >
            <Globe className="w-3 h-3 text-teal-400" />
            <span>{lang === 'en' ? 'हिंदी में देखें' : 'English'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
