import React, { useEffect } from 'react';
import { ArrowLeft, CreditCard, ShieldAlert, AlertTriangle, Phone, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LAB_DETAILS } from '../data';
import { useLanguage } from '../context/LanguageContext';

export const PaymentPolicyPage: React.FC = () => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('Back to Home', 'मुख्य पृष्ठ पर वापस जाएं')}</span>
          </Link>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-12 space-y-8">
          
          <div className="border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2.5 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
              <CreditCard className="w-4 h-4" />
              <span>{t('Financial & Transaction Terms', 'वित्तीय एवं भुगतान शर्तें')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t('Payment Policy', 'भुगतान नीति')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              {t('Last updated: 3 August 2026', 'अंतिम अद्यतन: 3 अगस्त 2026')} • {LAB_DETAILS.name}
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center">1</span>
              <span>{t('Available payment choices', 'उपलब्ध भुगतान विकल्प')}</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t(
                'Direct online UPI payment is supported exclusively for the four listed preventive health check-up packages (Healthkind Lite, Healthkind Active, Healthkind Total, and Healthkind Complete). Individual tests or multi-test profiles not listed with a fixed online price must be quoted and confirmed by Bharat Pathology first, and are payable at the laboratory counter or at collection unless the lab provides alternate guidance.',
                'डायरेक्ट ऑनलाइन UPI भुगतान विशेष रूप से चार सूचीबद्ध निवारक स्वास्थ्य पैकेजों (हेल्थकाइंड लाइट, एक्टिव, टोटल, कम्प्लीट) के लिए समर्थित है। निश्चित ऑनलाइन मूल्य के बिना अन्य व्यक्तिगत या मल्टी-टेस्ट प्रोफाइल्स की कीमत पहले भारत पैथोलॉजी द्वारा तय की जाती है, और उनका भुगतान प्रयोगशाला काउंटर या सैंपल कलेक्शन के समय किया जाता है।'
              )}
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center">2</span>
              <span>{t('Direct UPI payments & payee verification', 'डायरेक्ट UPI भुगतान एवं प्राप्तकर्ता नाम सत्यापन')}</span>
            </h2>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>{t('Important Verification Check:', 'आवश्यक सत्यापन नियम:')}</span>
              </div>
              <p>
                {t(
                  'When making a UPI transfer, always check that the payee name displayed in your banking or UPI app is Sanjay Kumar. If the payee name does not match, DO NOT proceed with payment and immediately call or WhatsApp Bharat Pathology. Under no circumstances should you ever reveal your UPI PIN, banking passwords, or SMS OTPs.',
                  'UPI ट्रांसफर करते समय, हमेशा जांचें कि आपके बैंकिंग ऐप में दिखने वाला प्राप्तकर्ता का नाम संजय कुमार (Sanjay Kumar) है। यदि नाम मेल नहीं खाता है, तो भुगतान न करें और तुरंत भारत पैथोलॉजी से संपर्क करें। किसी भी परिस्थिति में अपना UPI PIN या OTP साझा न करें।'
                )}
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center">3</span>
              <span>{t('Manual payment verification', 'मैन्युअल भुगतान सत्यापन')}</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t(
                'All UPI transactions are verified manually by laboratory staff. Generating a payment screen or submitting a transaction reference number (UTR) does not automatically confirm your appointment or sample collection. The collection booking is finalized only after Bharat Pathology confirms the bank settlement and verifies phlebotomist dispatch and test readiness.',
                'सभी UPI लेन-देन का सत्यापन लैब कर्मचारियों द्वारा मैन्युअल रूप से किया जाता है। भुगतान स्क्रीन या UTR नंबर सबमिट करने से आपकी बुकिंग अपने आप पक्की नहीं होती। सैंपल कलेक्शन की बुकिंग तभी पक्की मानी जाती है जब भारत पैथोलॉजी बैंक सेटलमेंट की पुष्टि कर ले और समय तय कर दे।'
              )}
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center">4</span>
              <span>{t('Requests, availability, and pricing', 'अनुरोध, उपलब्धता और मूल्य निर्धारण')}</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t(
                'Submitting the website form creates an enquiry and collection request for laboratory review. In the unlikely event of any discrepancy in amounts, test descriptions, or collection availability, please pause and contact Bharat Pathology directly before transacting.',
                'वेबसाइट फॉर्म सबमिट करने से समीक्षा हेतु एक अनुरोध तैयार होता है। यदि राशि या टेस्ट विवरण में कोई संशय हो, तो भुगतान करने से पहले सीधे भारत पैथोलॉजी से संपर्क करें।'
              )}
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center">5</span>
              <span>{t('Errors, duplicate payments, and refunds', 'त्रुटियां, डुप्लीकेट भुगतान एवं धनवापसी')}</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t(
                'If you experience an accidental duplicate payment or transmission failure, immediately call +91 88877 90574 with the payer name, date, exact transfer amount, and 12-digit transaction reference (UTR). The laboratory management will examine the bank ledger before approving and processing any necessary refund or credit adjustment.',
                'यदि अनजाने में डुप्लीकेट भुगतान या तकनीकी विफलता होती है, तो तुरंत +91 88877 90574 पर भुगतानकर्ता का नाम, तारीख, राशि और 12 अंकों का UTR नंबर देकर संपर्क करें। बैंक खाते की जांच के बाद आवश्यक समायोजन किया जाएगा।'
              )}
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center">6</span>
              <span>{t('Cancellations and rescheduling', 'रद्दीकरण एवं समय पुनर्निर्धारण')}</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t(
                'If you need to reschedule or cancel a requested home collection, please call or WhatsApp as early as possible before the agreed dispatch window. Any refund or fee adjustment is contingent upon whether the phlebotomist has already been dispatched or supplies consumed.',
                'यदि आप होम कलेक्शन का समय बदलना या रद्द करना चाहते हैं, तो कृपया निर्धारित समय से जितना जल्दी हो सके फोन या व्हाट्सएप करें। धनवापसी या समायोजन इस बात पर निर्भर करेगा कि तकनीशियन रवाना हुआ है या नहीं।'
              )}
            </p>
          </div>

          {/* Link to Privacy Policy & Helpline */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link
              to="/privacy-policy"
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800"
            >
              <span>{t('Read our Privacy Policy →', 'हमारी गोपनीयता नीति पढ़ें →')}</span>
            </Link>

            <a
              href={LAB_DETAILS.telLink}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('Payment Help: +91 88877 90574', 'भुगतान सहायता: +91 88877 90574')}</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
