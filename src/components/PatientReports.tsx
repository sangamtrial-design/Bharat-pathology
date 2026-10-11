import React from 'react';
import { FileText, ShieldAlert, MessageCircle, AlertTriangle, CheckCircle2, Phone } from 'lucide-react';
import { LAB_DETAILS } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useLabSettings } from '../context/LabSettingsContext';

export const PatientReports: React.FC = () => {
  const { t } = useLanguage();
  const { telLink, whatsappUrl } = useLabSettings();

  const reportWhatsappUrl = `${LAB_DETAILS.whatsappBaseUrl}?text=Hello%20Bharat%20Pathology%2C%20I%20would%20like%20to%20enquire%20about%20my%20test%20report.`;

  return (
    <section id="reports" className="py-16 sm:py-20 bg-white border-b border-slate-200/60 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-3xl border-2 border-teal-600/30 bg-gradient-to-br from-teal-50/50 via-white to-slate-50 p-6 sm:p-10 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
                  {t('Report Collection', 'जांच रिपोर्ट प्राप्ति')}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {t('Reports', 'रिपोर्ट्स')}
                </h3>
              </div>
            </div>
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('Confidential & Direct', 'गोपनीय एवं सुरक्षित')}</span>
            </span>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            <p>
              {t(
                "Diagnostic reports from Bharat Pathology are delivered strictly through two direct, verified methods: directly on your verified WhatsApp conversation, or as a printed physical copy collected from our lab counter at Bhimpura No. 1 after patient identity verification.",
                'भारत पैथोलॉजी द्वारा जारी जांच रिपोर्ट केवल दो सुरक्षित माध्यमों से प्रदान की जाती है: आपके सत्यापित व्हाट्सएप पर डिजिटल रूप से, अथवा पहचान सत्यापन के बाद भीमपुरा नं. 1 स्थित लैब काउंटर से मुद्रित (हार्डकॉपी) रूप में।'
              )}
            </p>
          </div>

          {/* Prominent Security Warning Box */}
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-rose-950 mb-0.5">
                {t('Security & Privacy Warning:', 'सुरक्षा एवं गोपनीयता चेतावनी:')}
              </span>
              <span>
                {t(
                  'Do NOT share any OTP, banking PIN, UPI PIN, or unrelated identity documents to request or receive your pathology report. Bharat Pathology will never request sensitive financial credentials.',
                  'अपनी पैथोलॉजी रिपोर्ट प्राप्त करने के लिए कभी भी कोई OTP, बैंक पिन, UPI पिन अथवा असंबंधित पहचान पत्र साझा न करें। भारत पैथोलॉजी कभी भी गोपनीय वित्तीय जानकारी नहीं मांगती।'
                )}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={reportWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition-all min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('Enquire about a report', 'रिपोर्ट के बारे में पूछें')}</span>
            </a>

            <a
              href={telLink}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all min-h-[44px]"
            >
              <Phone className="w-4 h-4 text-teal-600" />
              <span>{t('Call Reception', 'रिसेप्शन पर कॉल करें')}</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};
