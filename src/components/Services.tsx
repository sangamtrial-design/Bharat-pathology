import React from 'react';
import { Home, FlaskConical, MapPin, ArrowRight } from 'lucide-react';
import { SERVICES_DATA, LAB_DETAILS } from '../data';
import { useLanguage } from '../context/LanguageContext';

export const Services: React.FC = () => {
  const { t } = useLanguage();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-6 h-6 text-teal-600" />;
      case 'FlaskConical':
        return <FlaskConical className="w-6 h-6 text-indigo-600" />;
      case 'MapPin':
        return <MapPin className="w-6 h-6 text-emerald-600" />;
      default:
        return <FlaskConical className="w-6 h-6 text-teal-600" />;
    }
  };

  const handleAction = (href: string) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="services" className="py-16 sm:py-20 bg-white border-b border-slate-200/60 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-600 mb-2">
            {t('Care made easier', 'सुविधाजनक स्वास्थ्य सेवाएं')}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('Choose the way that works for you', 'अपनी सुविधानुसार विकल्प चुनें')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-normal">
            {t(
              'Whether requesting sample pickup at your residence or visiting our laboratory directly on Balauli Road.',
              'चाहे आप घर पर सैंपल कलेक्शन का अनुरोध करें या बलौली रोड स्थित हमारी प्रयोगशाला पर पधारें।'
            )}
          </p>
        </div>

        {/* 3 Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {SERVICES_DATA.map((service, idx) => (
            <div
              key={service.id}
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200/60 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  {getIcon(service.icon)}
                </div>

                <div className="text-xs font-bold text-teal-700/80 uppercase tracking-wider mb-1">
                  0{idx + 1}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2.5">
                  {t(service.title, service.hindiTitle)}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {t(service.description, service.hindiDescription)}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200/60">
                {service.actionHref.startsWith('#') ? (
                  <button
                    onClick={() => handleAction(service.actionHref)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 cursor-pointer group-hover:translate-x-1 transition-all"
                  >
                    <span>{t(service.actionText, service.hindiActionText)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : service.actionHref.startsWith('tel:') ? (
                  <a
                    href={service.actionHref}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 group-hover:translate-x-1 transition-all"
                  >
                    <span>{t(service.actionText, service.hindiActionText)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <a
                    href={service.actionHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 group-hover:translate-x-1 transition-all"
                  >
                    <span>{t(service.actionText, service.hindiActionText)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
