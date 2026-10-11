import React, { useState } from 'react';
import { ArrowRight, MessageCircle, MapPin, Clock, Home, ShieldCheck } from 'lucide-react';
import { LAB_DETAILS, IMAGES } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useLabSettings } from '../context/LabSettingsContext';

export const Hero: React.FC = () => {
  const { t } = useLanguage();
  const { settings, whatsappUrl } = useLabSettings();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const scrollToBooking = () => {
    const el = document.getElementById('booking-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const badgeText = t(
    settings.badgeText || 'Local Pathology Laboratory in Ballia',
    settings.badgeTextHi || 'बलिया में स्थानीय पैथोलॉजी प्रयोगशाला'
  );

  const headlineText = t(
    settings.heroHeadline || 'Pathology testing, closer to home.',
    settings.heroHeadlineHi || 'विश्वसनीय पैथोलॉजी जांच, आपके घर के करीब।'
  );

  const subheadText = t(
    settings.heroSubhead || 'Local laboratory testing and home sample collection from Bharat Pathology on Balauli Road, Bhimpura No. 1.',
    settings.heroSubheadHi || 'बलौली रोड, भीमपुरा नं. 1 स्थित भारत पैथोलॉजी द्वारा स्थानीय लैब परीक्षण एवं घर से सैंपल कलेक्शन की विश्वसनीय सुविधा।'
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50 pt-8 pb-16 sm:py-20 lg:py-24 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/90 text-teal-800 text-xs sm:text-sm font-semibold tracking-wide border border-teal-200 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>{badgeText}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              {headlineText}
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {subheadText}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={scrollToBooking}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all cursor-pointer min-h-[48px]"
              >
                <span>{t('Request Collection', 'होम कलेक्शन का अनुरोध करें')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all min-h-[48px]"
              >
                <MessageCircle className="w-5 h-5 fill-white/20" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Three Trust Chips */}
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              
              {/* Chip 1 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {t('Local laboratory', 'स्थानीय प्रयोगशाला')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {t('Balauli Road, Ballia', 'बलौली रोड, बलिया')}
                  </div>
                </div>
              </div>

              {/* Chip 2 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {t('Open daily', 'प्रतिदिन खुला')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    8:00 AM - 7:00 PM
                  </div>
                </div>
              </div>

              {/* Chip 3 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {t('Home collection', 'होम कलेक्शन')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {t('Available on request', 'अनुरोध पर उपलब्ध')}
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Hero Image with Frame and Graceful Fallback */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-100 aspect-4/3 sm:aspect-16/11">
                
                {/* Skeleton Shimmer */}
                {!imgLoaded && !imgError && (
                  <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-400">Loading lab view...</span>
                  </div>
                )}

                {/* Graceful Fallback if image fails to load */}
                {imgError ? (
                  <div className="absolute inset-0 bg-teal-900 text-white flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-teal-800 flex items-center justify-center mb-3">
                      <ShieldCheck className="w-8 h-8 text-teal-300" />
                    </div>
                    <div className="font-bold text-lg">{LAB_DETAILS.name}</div>
                    <p className="text-xs text-teal-200 mt-1 max-w-xs">{LAB_DETAILS.address}</p>
                  </div>
                ) : (
                  <img
                    src={IMAGES.heroLabInterior}
                    alt="Bharat Pathology laboratory diagnostic testing setup in Bhimpura"
                    width={640}
                    height={440}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${
                      imgLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="eager"
                    fetchPriority="high"
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgError(true)}
                  />
                )}

                {/* Bottom glass badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/80 shadow-md flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 -ml-4.5"></span>
                    <span className="font-semibold text-slate-800">
                      {t('Diagnostic Sample Collection', 'डायग्नोस्टिक सैंपल कलेक्शन')}
                    </span>
                  </div>
                  <span className="text-teal-700 font-bold">Ballia, UP</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
