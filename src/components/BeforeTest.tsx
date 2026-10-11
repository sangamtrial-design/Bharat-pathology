import React from 'react';
import { BEFORE_TEST_STEPS } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export const BeforeTest: React.FC = () => {
  const { t } = useLanguage();

  const getStepIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <CheckCircle2 className="w-5 h-5 text-teal-600" />;
      case 1:
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 2:
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <section id="before-test" className="py-16 sm:py-20 bg-white border-b border-slate-200/60 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-600 mb-2">
            {t('Clear information. No uncertain promises.', 'स्पष्ट जानकारी। कोई भ्रामक वादे नहीं।')}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('Before your test', 'अपनी जांच कराने से पहले')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {t(
              'Preparation, pricing, and report timing can vary by test. Bharat Pathology confirms the details that apply to your request before collection.',
              'जांच की तैयारी, शुल्क और रिपोर्ट तैयार होने का समय प्रत्येक टेस्ट के अनुसार अलग हो सकता है। भारत पैथोलॉजी सैंपल लेने से पहले सभी आवश्यक विवरणों की पुष्टि करती है।'
            )}
          </p>
        </div>

        {/* 3 Numbered Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {BEFORE_TEST_STEPS.map((step, idx) => (
            <div
              key={step.number}
              className="relative p-6 sm:p-7 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                    {getStepIcon(idx)}
                  </div>
                  <span className="text-3xl font-black text-slate-300 font-mono tracking-tighter">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                  {t(step.title, step.hindiTitle)}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {t(step.text, step.hindiText)}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-semibold text-teal-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                <span>{t('Patient transparency commitment', 'मरीज पारदर्शिता सिद्धांत')}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
