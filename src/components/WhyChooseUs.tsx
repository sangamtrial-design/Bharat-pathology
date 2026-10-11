import React from 'react';
import { MapPin, Clock, Home, FileText, CheckCircle2 } from 'lucide-react';
import { LAB_DETAILS } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useLabSettings } from '../context/LabSettingsContext';

export const WhyChooseUs: React.FC = () => {
  const { t } = useLanguage();
  const { settings } = useLabSettings();

  const displayHours = settings.hours || LAB_DETAILS.hours;
  const displayAddress = settings.address || LAB_DETAILS.address;

  const facts = [
    {
      icon: MapPin,
      title: t('Local lab in Bhimpura', 'भीमपुरा में स्थानीय लैब'),
      desc: t(displayAddress, LAB_DETAILS.hindiAddress),
      color: 'teal'
    },
    {
      icon: Clock,
      title: t('Open daily', 'प्रतिदिन सेवा उपलब्ध'),
      desc: t('Open 7 days a week: 8:00 AM to 7:00 PM', 'सप्ताह के सातों दिन खुला: सुबह 8:00 से शाम 7:00 तक'),
      color: 'amber'
    },
    {
      icon: Home,
      title: t('Home collection on request', 'अनुरोध पर होम कलेक्शन'),
      desc: t('Sample collection directly at your home by appointment', 'घर पर आकर सैंपल लेने की सुविधाजनक व्यवस्था'),
      color: 'emerald'
    },
    {
      icon: FileText,
      title: t('Reports via WhatsApp or print', 'व्हाट्सएप या प्रिंटेड रिपोर्ट'),
      desc: t('Receive verified digital reports or collected directly from the counter', 'सीधे व्हाट्सएप पर अथवा लैब काउंटर से मुद्रित हार्डकॉपी प्राप्त करें'),
      color: 'blue'
    }
  ];

  return (
    <section className="py-14 sm:py-16 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>{t('Clear & Honest Laboratory Care', 'विश्वसनीय एवं प्रामाणिक सेवा')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('Why patients in Ballia visit us', 'मरीज हमारे पास क्यों आते हैं')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-normal">
            {t(
              'Simple, honest pathology services with verified timings and direct counter support.',
              'सत्यापित समय, पारदर्शी शुल्क और सीधा स्थानीय संपर्क।'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {facts.map((fact, index) => {
            const Icon = fact.icon;
            return (
              <div
                key={index}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs text-teal-700 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5 leading-snug">
                    {fact.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {fact.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
