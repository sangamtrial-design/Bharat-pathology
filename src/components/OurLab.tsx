import React, { useState } from 'react';
import { MapPin, Clock, Phone, Navigation, Camera, ExternalLink } from 'lucide-react';
import { LAB_DETAILS, IMAGES } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useLabSettings } from '../context/LabSettingsContext';

export const OurLab: React.FC = () => {
  const { t } = useLanguage();
  const { settings, telLink } = useLabSettings();
  const [signLoaded, setSignLoaded] = useState(false);
  const [entranceLoaded, setEntranceLoaded] = useState(false);

  const displayAddress = settings.address || LAB_DETAILS.address;
  const displayHours = settings.hours || LAB_DETAILS.hours;
  const displayPhone = settings.phone || LAB_DETAILS.phoneDisplay;

  return (
    <section id="our-lab" className="py-16 sm:py-24 bg-slate-50/70 border-b border-slate-200/60 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-600 mb-2">
            {t('Our actual location', 'हमारा वास्तविक पता')}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('A local lab you can find easily', 'आसानी से मिलने वाली स्थानीय लैब')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {t(
              'These are real photos of Bharat Pathology at Bhimpura No. 1 on Balauli Road in Ballia.',
              'ये बलिया के भीमपुरा नं. 1 में बलौली रोड स्थित भारत पैथोलॉजी की वास्तविक तस्वीरें हैं।'
            )}
          </p>
        </div>

        {/* Real Photos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          
          {/* Photo 1: Exterior Sign */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
              {!signLoaded && (
                <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
                  <span className="text-xs text-slate-400">Loading sign photo...</span>
                </div>
              )}
              <img
                src={IMAGES.realExteriorSign}
                alt="Bharat Pathology exterior board and road signboard on Balauli Road"
                width={600}
                height={450}
                className={`w-full h-full object-cover transition-opacity duration-500 hover:scale-102 transition-transform duration-300 ${
                  signLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                onLoad={() => setSignLoaded(true)}
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-teal-400" />
                <span>{t('Real Photo', 'वास्तविक तस्वीर')}</span>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <h3 className="font-bold text-slate-900 text-base">
                {t('Exterior sign on Balauli Road', 'बलौली रोड पर बाहरी साइनबोर्ड')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t(
                  'Easily spot our signboard when arriving from Bhimpura market along Balauli Road.',
                  'भीमपुरा बाजार से बलौली रोड पर आते समय आसानी से दिखने वाला मुख्य बोर्ड।'
                )}
              </p>
            </div>
          </div>

          {/* Photo 2: Entrance */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
              {!entranceLoaded && (
                <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
                  <span className="text-xs text-slate-400">Loading entrance photo...</span>
                </div>
              )}
              <img
                src={IMAGES.realEntrance}
                alt="Bharat Pathology laboratory entrance and sample counter"
                width={600}
                height={450}
                className={`w-full h-full object-cover transition-opacity duration-500 hover:scale-102 transition-transform duration-300 ${
                  entranceLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                onLoad={() => setEntranceLoaded(true)}
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-teal-400" />
                <span>{t('Real Photo', 'वास्तविक तस्वीर')}</span>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <h3 className="font-bold text-slate-900 text-base">
                {t('Laboratory entrance', 'प्रयोगशाला का मुख्य प्रवेश द्वार')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t(
                  'Patient reception and sample registration counter at Bhimpura No. 1.',
                  'भीमपुरा नं. 1 स्थित मरीज रिसेप्शन और सैंपल पंजीकरण काउंटर।'
                )}
              </p>
            </div>
          </div>

        </div>

        {/* Location Details & Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Info details */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {LAB_DETAILS.name}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-teal-700">
                  {t(LAB_DETAILS.tagline, LAB_DETAILS.hindiTagline)}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {t('Address', 'पता')}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-slate-800">
                      {displayAddress}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {t('Hours', 'समय')}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-slate-800">
                      {displayHours}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {t('Helpline', 'हेल्पलाइन')}
                    </span>
                    <a
                      href={telLink}
                      className="text-sm sm:text-base font-bold text-teal-700 hover:underline"
                    >
                      {displayPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <a
                  href={telLink}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-all min-h-[44px]"
                >
                  <Phone className="w-4 h-4 text-teal-600" />
                  <span>{t('Call before visiting', 'आने से पहले कॉल करें')}</span>
                </a>

                <a
                  href={LAB_DETAILS.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-xs transition-all min-h-[44px]"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{t('Get directions', 'दिशा-निर्देश देखें')}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>

            {/* Map Preview Embed */}
            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner relative aspect-4/3">
                <iframe
                  title="Bharat Pathology location map"
                  src="https://maps.google.com/maps?q=Bharat+Pathology+Bhimpura+Balauli+Road+Ballia&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  aria-label="Map showing Bharat Pathology in Bhimpura, Ballia"
                ></iframe>
                <div className="absolute bottom-2 right-2">
                  <a
                    href={LAB_DETAILS.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/95 backdrop-blur-xs text-xs font-semibold text-teal-800 px-2.5 py-1 rounded-md shadow-xs border border-slate-200 hover:bg-white flex items-center gap-1"
                  >
                    <span>{t('Open in Maps', 'गूगल मैप्स में खोलें')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
