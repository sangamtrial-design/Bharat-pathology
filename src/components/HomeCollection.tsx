import React, { useState } from 'react';
import { ArrowRight, Phone, MessageCircle, ClipboardCheck, Calendar, PhoneCall } from 'lucide-react';
import { LAB_DETAILS, IMAGES } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useLabSettings } from '../context/LabSettingsContext';

export const HomeCollection: React.FC = () => {
  const { t } = useLanguage();
  const { telLink, whatsappUrl } = useLabSettings();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const scrollToForm = () => {
    const el = document.getElementById('booking-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const steps = [
    {
      num: 1,
      icon: ClipboardCheck,
      title: t('Tell us which test or package you need.', 'बताएं कि आपको किस टेस्ट या पैकेज की आवश्यकता है।'),
      desc: t('Select from our preventive packages or individual pathology tests.', 'हमारे निवारक पैकेजों अथवा व्यक्तिगत पैथोलॉजी टेस्ट्स में से चुनें।')
    },
    {
      num: 2,
      icon: Calendar,
      title: t('Share your address and preferred collection date.', 'अपना पता और पसंदीदा सैंपल कलेक्शन तिथि साझा करें।'),
      desc: t('Provide your local location in Bhimpura or nearby Ballia areas.', 'भीमपुरा या आस-पास के बलिया क्षेत्रों का अपना पता दर्ज करें।')
    },
    {
      num: 3,
      icon: PhoneCall,
      title: t('The lab will contact you to confirm the request.', 'लैब कर्मचारी अनुरोध की पुष्टि के लिए आपसे संपर्क करेंगे।'),
      desc: t('We confirm preparation guidelines, timing, and technician dispatch.', 'हम आवश्यक तैयारी, समय और तकनीशियन के आगमन की पुष्टि करेंगे।')
    }
  ];

  return (
    <section id="home-collection" className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/60 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Context & Steps */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-600 mb-2">
                {t('Home sample collection', 'होम सैंपल कलेक्शन')}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {t('Your test request can begin from home.', 'आपकी जांच का अनुरोध घर से ही शुरू हो सकता है।')}
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed font-normal">
                {t(
                  'Send your details through the form, by phone, or on WhatsApp. Bharat Pathology will contact you to confirm the collection request.',
                  'वेबसाइट फॉर्म, सीधे फोन कॉल या व्हाट्सएप के माध्यम से अपनी जानकारी भेजें। भारत पैथोलॉजी टीम कलेक्शन अनुरोध की पुष्टि के लिए आपसे संपर्क करेगी।'
                )}
              </p>
            </div>

            {/* 3 Step Cards */}
            <div className="space-y-4">
              {steps.map((step) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={step.num}
                    className="flex items-start gap-4 p-4.5 rounded-xl bg-white border border-slate-200/80 shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-bold text-sm">
                      <IconComponent className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                        {t(`Step ${step.num}`, `चरण ${step.num}`)}
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-slate-900 mt-0.5">
                        {step.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons: Send Request, Call, WhatsApp */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer min-h-[44px]"
              >
                <span>{t('Send Request', 'अनुरोध भेजें')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={telLink}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-all min-h-[44px]"
              >
                <Phone className="w-4 h-4 text-teal-600" />
                <span>{t('Call', 'कॉल करें')}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-all min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>

          </div>

          {/* Right Column: Home Collection Photo */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-slate-100 aspect-4/3 sm:aspect-5/4">
              
              {!imgLoaded && !imgError && (
                <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
                  <span className="text-xs font-medium text-slate-400">Loading image...</span>
                </div>
              )}

              {imgError ? (
                <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                  <ClipboardCheck className="w-12 h-12 text-teal-600 mb-2" />
                  <p className="font-semibold text-slate-800">{t('Home Sample Collection', 'घर पर सैंपल कलेक्शन')}</p>
                  <p className="text-xs text-slate-500 mt-1">{t('Safe and hygienic sample collection by lab staff', 'सुरक्षित और स्वच्छ सैंपल कलेक्शन')}</p>
                </div>
              ) : (
                <img
                  src={IMAGES.homeCollection}
                  alt="Home sample collection service by Bharat Pathology in Ballia"
                  width={600}
                  height={480}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imgLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                />
              )}

              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/80 shadow-sm text-xs flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  {t('Doorstep Phlebotomy Service', 'घर बैठे सैंपल जांच सुविधा')}
                </span>
                <span className="text-teal-700 font-bold">{t('On Request', 'अनुरोध पर')}</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
