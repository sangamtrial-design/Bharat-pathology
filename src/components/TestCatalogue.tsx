import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, FlaskConical, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { CATALOGUE_TESTS, TestCatalogueItem } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface TestCatalogueProps {
  onSelectTest: (testName: string) => void;
}

const CATEGORIES = ['All', 'Blood', 'Urine', 'Hormone', 'Infection', 'Vitamin', 'Special'] as const;

export const TestCatalogue: React.FC<TestCatalogueProps> = ({ onSelectTest }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [tests, setTests] = useState<TestCatalogueItem[]>(CATALOGUE_TESTS);

  // Subscribe to dynamic tests collection in Firestore with fallback to local seed data
  useEffect(() => {
    try {
      const testsRef = collection(db, 'tests');
      const unsubscribe = onSnapshot(
        testsRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteTests: TestCatalogueItem[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name || doc.id,
                hindiName: data.hindiName,
                category: data.category || 'Blood',
                sampleType: data.sampleType || 'Blood',
                fastingRequirement: data.fastingRequirement || 'Confirm with lab',
                typicalReportTime: data.typicalReportTime || 'Confirm with lab',
                price: data.price || 'Confirm with lab',
                description: data.description || ''
              };
            });
            // Merge with local list for complete directory
            const combined = [...remoteTests];
            CATALOGUE_TESTS.forEach((localTest) => {
              if (!combined.some((ct) => ct.name.toLowerCase() === localTest.name.toLowerCase())) {
                combined.push(localTest);
              }
            });
            setTests(combined);
          }
        },
        (error) => {
          console.warn('Could not load remote tests from Firestore, using local tests list:', error);
        }
      );
      return () => unsubscribe();
    } catch {
      // Offline or local fallback
    }
  }, []);

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch =
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (test.hindiName && test.hindiName.includes(searchTerm)) ||
        (test.description && test.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || test.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [tests, searchTerm, selectedCategory]);

  const handleRequestTest = (test: TestCatalogueItem) => {
    onSelectTest(test.name);
    const formElement = document.getElementById('booking-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="catalog" className="py-16 sm:py-24 bg-slate-50/70 border-b border-slate-200/60 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-600 mb-2">
            {t('Comprehensive Test Directory', 'व्यापक पैथोलॉजी टेस्ट सूची')}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('Search individual lab tests', 'अपनी आवश्यक जांच खोजें')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {t(
              'Browse common diagnostic tests available through Bharat Pathology. All parameters, timings, and fees are confirmed directly with our lab.',
              'भारत पैथोलॉजी में उपलब्ध जांचों की सूची देखें। सैंपल प्रकार, आवश्यक तैयारी एवं समय की जानकारी सीधे लैब द्वारा सुनिश्चित की जाती है।'
            )}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-4xl mx-auto mb-10 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('Search test by name (e.g. CBC, Thyroid, Sugar, LFT)...', 'जांच का नाम खोजें (उदा. सीबीसी, थायराइड, शुगर, LFT)...')}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-300 shadow-xs text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-teal-700'
                }`}
              >
                {cat === 'All' ? t('All Tests', 'सभी जांचें') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {test.name}
                  </h3>
                  <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-semibold">
                    {test.category}
                  </span>
                </div>

                {test.hindiName && (
                  <p className="text-xs text-slate-500 mb-2 font-medium">
                    {test.hindiName}
                  </p>
                )}

                {test.description && (
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed font-normal line-clamp-2">
                    {test.description}
                  </p>
                )}

                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('Sample Type:', 'सैंपल प्रकार:')}</span>
                    <span className="font-semibold text-slate-800">{test.sampleType}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('Fasting:', 'फास्टिंग:')}</span>
                    <span className="font-semibold text-slate-800">
                      {test.fastingRequirement === 'Confirm with lab'
                        ? t('Confirm with lab', 'लैब से पुष्टि करें')
                        : test.fastingRequirement}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('Report Time:', 'रिपोर्ट समय:')}</span>
                    <span className="font-semibold text-slate-800">
                      {test.typicalReportTime === 'Confirm with lab'
                        ? t('Confirm with lab', 'लैब से पुष्टि करें')
                        : test.typicalReportTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('Price:', 'शुल्क:')}</span>
                    <span className="font-semibold text-teal-700">
                      {test.price === 'Confirm with lab'
                        ? t('Confirm with lab', 'लैब से पुष्टि करें')
                        : test.price}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRequestTest(test)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <span>{t('Request this test', 'इस जांच का अनुरोध करें')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 max-w-md mx-auto">
            <FlaskConical className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="font-bold text-slate-900 text-base">{t('No matching test found', 'कोई टेस्ट नहीं मिला')}</h4>
            <p className="text-xs text-slate-500 mt-1">
              {t(
                'We offer additional specialized tests. Contact Bharat Pathology directly by phone or WhatsApp to enquire about any specific investigation.',
                'हम अन्य विशेष जांचें भी उपलब्ध कराते हैं। किसी भी विशेष जांच के लिए कृपया सीधे फोन या व्हाट्सएप पर संपर्क करें।'
              )}
            </p>
          </div>
        )}

      </div>
    </section>
  );
};
