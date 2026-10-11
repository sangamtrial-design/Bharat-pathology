import React from 'react';
import { MapPin, Phone, MessageCircle, Truck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLabSettings } from '../context/LabSettingsContext';

export const ServiceAreas: React.FC = () => {
  const { t } = useLanguage();
  const { settings, telLink, whatsappUrl } = useLabSettings();

  const areas = settings.serviceAreas || [];
  const charge = settings.defaultCollectionCharge;

  return (
    <section id="service-areas" className="py-16 sm:py-20 bg-white border-b border-slate-200/60 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-3xl bg-slate-50 border border-slate-200/90 p-6 sm:p-10 shadow-xs">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/80 pb-6 mb-8">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold mb-2">
                <Truck className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('Home Collection Coverage', 'होम सैंपल कलेक्शन क्षेत्र')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('Service Areas & Locations', 'सेवा क्षेत्र एवं उपलब्ध इलाके')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal">
                {t(
                  'Our trained phlebotomists visit homes in Bhimpura and surrounding localities in Ballia district.',
                  'हमारे प्रशिक्षित तकनीशियन भीमपुरा एवं बलिया के निकटवर्ती क्षेत्रों में घर जाकर सैंपल लेते हैं।'
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs shrink-0 text-left md:text-right">
              <span className="text-xs text-slate-500 font-medium block">
                {t('Collection Charge', 'होम कलेक्शन शुल्क')}
              </span>
              <span className="text-lg font-bold text-teal-700">
                {charge && charge > 0
                  ? `₹${charge}`
                  : t('Confirm with lab', 'लैब से पुष्टि करें')}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {t('Per collection visit', 'प्रति विजिट')}
              </span>
            </div>
          </div>

          {areas.length > 0 ? (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('Covered Localities & Villages:', 'शामिल इलाके एवं गांव:')}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {areas.map((area, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 font-medium text-xs sm:text-sm shadow-xs"
                  >
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{area}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center max-w-xl mx-auto space-y-3">
              <MapPin className="w-8 h-8 text-teal-600 mx-auto" />
              <h3 className="font-bold text-base text-slate-900">
                {t('Contact the lab to confirm your area', 'अपने क्षेत्र की पुष्टि के लिए लैब से संपर्क करें')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {t(
                  'Home sample collection is provided across Bhimpura No. 1 and nearby villages upon technician availability. Call or WhatsApp our lab coordinator directly.',
                  'भीमपुरा नं. 1 एवं आसपास के गांवों में तकनीशियन की उपलब्धता के अनुसार घर पर सैंपल कलेक्शन उपलब्ध है। सीधे फोन या व्हाट्सएप पर संपर्क करें।'
                )}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <a
                  href={telLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all min-h-[44px]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('Call Lab', 'कॉल करें')}</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all min-h-[44px]"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
