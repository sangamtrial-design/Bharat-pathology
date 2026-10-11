import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Lock, AlertTriangle, FileText, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LAB_DETAILS } from '../data';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPolicyPage: React.FC = () => {
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
              <ShieldCheck className="w-4 h-4" />
              <span>{t('Legal & Patient Transparency', 'पारदर्शिता एवं कानूनी सूचना')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t('Privacy Policy', 'गोपनीयता नीति')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              {t('Last updated: 3 August 2026', 'अंतिम अद्यतन: 3 अगस्त 2026')} • {LAB_DETAILS.name}
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center">1</span>
              <span>{t('Information we collect', 'हम कौन सी जानकारी एकत्र करते हैं')}</span>
            </h2>
            <div className="text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                {t(
                  'When you use Bharat Pathology’s online contact or collection request form, we may collect the following details provided voluntarily by you:',
                  'जब आप भारत पैथोलॉजी के ऑनलाइन संपर्क या कलेक्शन अनुरोध फॉर्म का उपयोग करते हैं, तो हम आपके द्वारा स्वेच्छा से प्रदान की गई निम्नलिखित जानकारी एकत्र कर सकते हैं:'
                )}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t('Your full name', 'आपका पूरा नाम')}</li>
                <li>{t('Phone number (mobile)', 'फोन नंबर (मोबाइल)')}</li>
                <li>{t('Age and Gender', 'आयु एवं लिंग')}</li>
                <li>{t('Requested test or health package', 'वांछित जांच अथवा स्वास्थ्य पैकेज')}</li>
                <li>{t('Preferred collection date', 'पसंदीदा सैंपल कलेक्शन तिथि')}</li>
                <li>{t('Collection address and landmark', 'कलेक्शन का पता एवं लैंडमार्क')}</li>
                <li>{t('Payment choice and UPI transaction reference (UTR) if paying online', 'भुगतान का विकल्प एवं UPI ट्रांजैक्शन रेफरेंस')}</li>
                <li>{t('Optional patient notes or message', 'वैकल्पिक मरीज संदेश या अतिरिक्त विवरण')}</li>
                <li>{t('Ordinary technical information (such as basic browser information)', 'सामान्य तकनीकी डेटा (जैसे ब्राउज़र प्रकार)')}</li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center">2</span>
              <span>{t('How it is used', 'जानकारी का उपयोग कैसे किया जाता है')}</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t(
                'We use this information exclusively to review your enquiry, contact you by telephone or WhatsApp, confirm test details, arrange home phlebotomy visits, verify UPI payment references where applicable, and provide patient support. A website request is strictly an enquiry until Bharat Pathology contacts you and confirms the booking.',
                'हम इस जानकारी का उपयोग विशेष रूप से आपके अनुरोध की समीक्षा करने, टेलीफोन या व्हाट्सएप द्वारा आपसे संपर्क करने, जांच विवरण की पुष्टि करने, होम सैंपल कलेक्शन की व्यवस्था करने, UPI भुगतान संदर्भों को सत्यापित करने और मरीज सहायता प्रदान करने के लिए करते हैं। वेबसाइट अनुरोध तब तक केवल एक पूछताछ है जब तक कि भारत पैथोलॉजी आपसे संपर्क करके बुकिंग की पुष्टि नहीं कर देती।'
              )}
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center">3</span>
              <span>{t('Storage and limited sharing', 'डेटा भंडारण और सीमित साझाकरण')}</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t(
                'Your information is never sold, traded, or rented to third parties or marketing brokers. Information may only be handled by operational service providers strictly necessary to facilitate communication (such as messaging infrastructure) or disclosed if expressly required by applicable Indian law. Laboratory access to records is strictly limited to authorized personnel who require it for testing and sample management.',
                'आपकी जानकारी कभी भी तीसरे पक्षों या विपणन दलालों को बेची, व्यापार या किराए पर नहीं दी जाती है। संचार सुगम बनाने के लिए आवश्यक सेवा प्रदाताओं या भारतीय कानून द्वारा अनिवार्य होने पर ही इसे अधिकृत कर्मियों तक सीमित रखा जाता है।'
              )}
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center">4</span>
              <span>{t('Health and payment information', 'स्वास्थ्य एवं भुगतान संबंधी जानकारी')}</span>
            </h2>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>{t('Critical Security Notice:', 'महत्वपूर्ण सुरक्षा सूचना:')}</span>
              </div>
              <p>
                {t(
                  'Please share only the medical and contact details needed for your test request. Never send or share your UPI PIN, OTP, debit/credit card PINs, CVV, or banking passwords. Submitting a transaction reference number (UTR) confirms that a transfer took place for manual verification, but does NOT grant anyone access to your bank or UPI account.',
                  'कृपया केवल वही चिकित्सा व संपर्क जानकारी साझा करें जो आवश्यक हो। कभी भी अपना UPI PIN, OTP, कार्ड पिन या बैंकिंग पासवर्ड साझा न करें। एक ट्रांजैक्शन रेफरेंस (UTR) केवल भुगतान के सत्यापन हेतु दर्ज किया जाता है, इससे किसी को भी आपके बैंक या UPI खाते का नियंत्रण नहीं मिलता।'
                )}
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center">5</span>
              <span>{t('Retention, security, and your choices', 'डेटा सुरक्षा, प्रतिधारण और आपके अधिकार')}</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t(
                'We retain records only as long as reasonably needed to fulfill sample processing, report delivery, and statutory diagnostic laboratory record obligations. While we implement reasonable safeguards, no electronic transmission is 100% secure. You may call +91 88877 90574 at any time to enquire about, update, or request deletion of your contact information where not constrained by mandatory diagnostic regulatory records.',
                'हम रिकॉर्ड केवल तब तक रखते हैं जब तक सैंपल प्रोसेसिंग, रिपोर्ट डिलीवरी और वैधानिक दायित्वों को पूरा करने के लिए आवश्यक हो। आप अपनी संपर्क जानकारी के बारे में पूछने, सुधारने या हटाने का अनुरोध करने के लिए किसी भी समय +91 88877 90574 पर संपर्क कर सकते हैं।'
              )}
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center">6</span>
              <span>{t('Updates to this notice', 'इस नोटिस में परिवर्तन')}</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t(
                'Bharat Pathology may update this privacy notice periodically to reflect operational, laboratory, or legal updates. Any revisions will be published on this page with the updated revision date.',
                'भारत पैथोलॉजी इस गोपनीयता नोटिस को समय-समय पर अपडेट कर सकती है। कोई भी संशोधन इस पृष्ठ पर नई तिथि के साथ प्रकाशित किया जाएगा।'
              )}
            </p>
          </div>

          {/* Link to Payment Policy & Contact */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link
              to="/payment-policy"
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800"
            >
              <span>{t('Read our Payment Policy →', 'हमारी भुगतान नीति पढ़ें →')}</span>
            </Link>

            <a
              href={LAB_DETAILS.telLink}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('Queries? Call +91 88877 90574', 'प्रश्न? कॉल करें +91 88877 90574')}</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
