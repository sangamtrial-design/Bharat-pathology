import React, { useState } from 'react';
import { Check, Minus, ArrowRight, Sparkles, Info, HelpCircle } from 'lucide-react';
import { HEALTH_PACKAGES, PACKAGE_COMPARISON, PACKAGE_COMPARISON_NOTE, HINDI_PACKAGE_COMPARISON_NOTE, RAPID_CARD_INFO, PackageItem } from '../data';
import { useLanguage } from '../context/LanguageContext';

interface HealthPackagesProps {
  onSelectPackage: (packageDropdownValue: string) => void;
}

export const HealthPackages: React.FC<HealthPackagesProps> = ({ onSelectPackage }) => {
  const { t } = useLanguage();
  const [showRapidTooltip, setShowRapidTooltip] = useState(false);

  const getDropdownValueForPackage = (pkg: PackageItem): string => {
    switch (pkg.id) {
      case 'lite':
        return 'Healthkind Lite Package - Rs 1,099';
      case 'active':
        return 'Healthkind Active Package - Rs 1,449';
      case 'total':
        return 'Healthkind Total Package - Rs 1,949';
      case 'complete':
        return 'Healthkind Complete Package - Rs 3,299';
      default:
        return `${pkg.name} Package - Rs ${pkg.price.toLocaleString('en-IN')}`;
    }
  };

  const handlePackageClick = (pkg: PackageItem) => {
    const dropdownVal = getDropdownValueForPackage(pkg);
    onSelectPackage(dropdownVal);
    const formElement = document.getElementById('booking-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check if Active & Total have configured data differences
  const activePkg = HEALTH_PACKAGES.find((p) => p.id === 'active');
  const totalPkg = HEALTH_PACKAGES.find((p) => p.id === 'total');
  const hasDiffExplanation = Boolean(totalPkg?.differenceExplanation?.trim() || activePkg?.differenceExplanation?.trim());

  return (
    <section id="packages" className="py-16 sm:py-24 bg-white border-b border-slate-200/60 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-600 mb-2">
            {t('Preventive health check-ups', 'प्रिवेंटिव हेल्थ चेक-अप')}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('Compare packages with confidence', 'स्पष्टता और विश्वास के साथ पैकेजों की तुलना करें')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {t(
              'Designed for routine wellness tracking, organ health monitoring, and comprehensive preventative care in Ballia.',
              'नियमित स्वास्थ्य निगरानी, अंगों की कार्यप्रणाली परीक्षण एवं संपूर्ण निवारक देखभाल के लिए विशेष पैकेज।'
            )}
          </p>
        </div>

        {/* 4 Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-16">
          {HEALTH_PACKAGES.map((pkg) => {
            const isComplete = pkg.id === 'complete';
            const isTotal = pkg.id === 'total';

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 ${
                  isComplete
                    ? 'bg-gradient-to-b from-teal-900 to-slate-900 text-white shadow-xl ring-2 ring-teal-500'
                    : isTotal
                    ? 'bg-white border-2 border-teal-500 shadow-md ring-1 ring-teal-500/20'
                    : 'bg-white border border-slate-200/90 hover:border-teal-300 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Badge if present */}
                {pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                    <span>{pkg.badge}</span>
                  </div>
                )}
                {pkg.popular && !pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[11px] font-bold uppercase px-3 py-1 rounded-full tracking-wider shadow-xs">
                    {t('Popular Choice', 'लोकप्रिय विकल्प')}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className={`text-xl font-bold tracking-tight ${isComplete ? 'text-white' : 'text-slate-900'}`}>
                      {pkg.name}
                    </h3>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-sm font-semibold ${isComplete ? 'text-teal-300' : 'text-slate-500'}`}>
                        ₹
                      </span>
                      <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isComplete ? 'text-white' : 'text-teal-700'}`}>
                        {pkg.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className={`text-xs ${isComplete ? 'text-slate-300' : 'text-slate-500'}`}>
                      {t('Fixed package price', 'निश्चित पैकेज मूल्य')}
                    </span>
                  </div>

                  <p className={`text-xs sm:text-sm min-h-[40px] mb-3 leading-relaxed font-medium ${isComplete ? 'text-slate-200' : 'text-slate-600'}`}>
                    {pkg.description}
                  </p>

                  {/* "What is the difference?" line only if data differs per requirement A5 */}
                  {pkg.differenceExplanation && (
                    <div className="mb-4 p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-[11px] leading-relaxed">
                      <span className="font-bold">{t('What is the difference? ', 'क्या अंतर है? ')}</span>
                      <span>{pkg.differenceExplanation}</span>
                    </div>
                  )}

                  <div className={`pt-4 border-t ${isComplete ? 'border-slate-700' : 'border-slate-100'} space-y-2.5 mb-6`}>
                    <div className={`text-xs font-bold uppercase tracking-wider ${isComplete ? 'text-teal-300' : 'text-slate-500'}`}>
                      {t('Key Inclusions', 'प्रमुख जांचें')}:
                    </div>
                    {pkg.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isComplete ? 'text-teal-400' : 'text-teal-600'}`} />
                        <span className={isComplete ? 'text-slate-200' : 'text-slate-700'}>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handlePackageClick(pkg)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                    isComplete
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md'
                      : isTotal
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-800 border border-slate-200'
                  }`}
                >
                  <span>{t('Request package', 'पैकेज बुक करें')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Package Comparison Table */}
        <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-5 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {t('Tests included by package', 'पैकेज अनुसार शामिल जांच विवरण')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {t('Compare all 15 diagnostic parameters side-by-side', 'सभी 15 जांच मापदंडों की तुलना देखें')}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5 text-teal-600" /> {t('Included', 'शामिल')}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Minus className="w-3.5 h-3.5 text-slate-400" /> {t('Not included', 'शामिल नहीं')}
              </span>
            </div>
          </div>

          {/* Horizontally scrollable container */}
          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-white/70">
                  <th className="py-3 px-3.5 rounded-l-lg">{t('Test / Profile', 'जांच / प्रोफाइल')}</th>
                  <th className="py-3 px-3 text-center">
                    <div>Lite</div>
                    <div className="text-[11px] font-normal text-teal-700">₹1,099</div>
                  </th>
                  <th className="py-3 px-3 text-center">
                    <div>Active</div>
                    <div className="text-[11px] font-normal text-teal-700">₹1,449</div>
                  </th>
                  <th className="py-3 px-3 text-center bg-teal-50/50">
                    <div>Total</div>
                    <div className="text-[11px] font-normal text-teal-700">₹1,949</div>
                  </th>
                  <th className="py-3 px-3 text-center rounded-r-lg bg-teal-100/50">
                    <div className="font-bold text-slate-900">Complete</div>
                    <div className="text-[11px] font-bold text-teal-800">₹3,299</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {PACKAGE_COMPARISON.map((row, index) => {
                  const isRapidCard = row.test.toLowerCase().includes('rapid card');
                  const hasRapidExplanation = Boolean(RAPID_CARD_INFO.explanation.trim());

                  return (
                    <tr key={index} className="hover:bg-white/60 transition-colors">
                      <td className="py-2.5 px-3.5 font-medium text-slate-800">
                        <div className="inline-flex items-center gap-1.5 relative">
                          <span>{t(row.test, row.hindiTest)}</span>
                          {/* Holiday rapid card tooltip only if explanation is present per requirement A6 */}
                          {isRapidCard && hasRapidExplanation && (
                            <div className="inline-block relative">
                              <button
                                type="button"
                                onClick={() => setShowRapidTooltip(!showRapidTooltip)}
                                onMouseEnter={() => setShowRapidTooltip(true)}
                                onMouseLeave={() => setShowRapidTooltip(false)}
                                className="text-teal-600 hover:text-teal-800 cursor-pointer p-0.5 rounded-full"
                                aria-label="Holiday rapid card explanation"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                              {showRapidTooltip && (
                                <div className="absolute left-0 bottom-full mb-1 z-50 w-56 p-2 rounded-lg bg-slate-900 text-white text-[11px] shadow-lg leading-tight pointer-events-none">
                                  {RAPID_CARD_INFO.explanation}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {row.lite ? (
                          <Check className="w-4 h-4 text-teal-600 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {row.active ? (
                          <Check className="w-4 h-4 text-teal-600 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center bg-teal-50/30">
                        {row.total ? (
                          <Check className="w-4 h-4 text-teal-600 mx-auto font-bold" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center bg-teal-100/20">
                        {row.complete ? (
                          <Check className="w-4 h-4 text-teal-700 mx-auto font-bold" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Difference Note: Only shown if difference exists or note is relevant */}
          {hasDiffExplanation && (
            <div className="mt-5 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                {t(PACKAGE_COMPARISON_NOTE, HINDI_PACKAGE_COMPARISON_NOTE)}
              </span>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
