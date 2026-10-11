import React from 'react';
import { Star, ExternalLink, ShieldCheck } from 'lucide-react';
import { LAB_DETAILS } from '../data';
import { useLanguage } from '../context/LanguageContext';

export const PatientFeedback: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-14 sm:py-18 bg-slate-50/70 border-b border-slate-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-semibold mb-4 border border-amber-200">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{t('Authentic Patient Experiences', 'प्रामाणिक मरीज अनुभव')}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('Read independent Google feedback', 'गूगल पर स्वतंत्र समीक्षाएं और फीडबैक पढ़ें')}
        </h2>

        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          {t(
            'We value genuine patient experiences. We do not invent, curate, or publish unverified reviews on this website. Read authentic reviews directly on our Google Maps profile.',
            'हम मरीजों के वास्तविक अनुभवों का सम्मान करते हैं। हम इस वेबसाइट पर कोई भी काल्पनिक समीक्षाएं प्रकाशित नहीं करते। सीधे हमारे गूगल मैप्स प्रोफाइल पर वास्तविक अनुभव देखें।'
          )}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <a
            href={LAB_DETAILS.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all min-h-[44px]"
          >
            <span>{t('Open in Google', 'गूगल मैप्स में खोलें')}</span>
            <ExternalLink className="w-4 h-4 text-slate-300" />
          </a>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t('Third-party verified reviews on Google Maps', 'गूगल मैप्स पर तृतीय-पक्ष सत्यापित समीक्षाएं')}</span>
        </div>

      </div>
    </section>
  );
};
