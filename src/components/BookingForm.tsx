import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Loader2,
  Database,
  RotateCcw,
  User,
  Upload,
  FileCheck,
  X
} from 'lucide-react';
import {
  LAB_DETAILS,
  TEST_DROPDOWN_OPTIONS,
  PRICED_PACKAGES_MAP
} from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useLabSettings } from '../context/LabSettingsContext';
import { storePatientBookingRequest } from '../lib/firebase';
import { Link } from 'react-router-dom';

interface BookingFormProps {
  selectedPackageDropdown?: string;
}

const TIME_SLOTS = [
  'Morning (8:00 AM – 11:00 AM)',
  'Midday (11:00 AM – 2:00 PM)',
  'Afternoon (2:00 PM – 5:00 PM)',
  'Evening (5:00 PM – 7:00 PM)'
] as const;

export const BookingForm: React.FC<BookingFormProps> = ({ selectedPackageDropdown }) => {
  const { t } = useLanguage();
  const { settings, telLink, whatsappUrl } = useLabSettings();

  const activeUpiId = (settings.upiId || LAB_DETAILS.upiIdPlaceholder).trim();
  const activePayeeName = (settings.upiPayeeName || LAB_DETAILS.upiPayeeName).trim();

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other' | 'Prefer not to say' | ''>('');
  const [age, setAge] = useState('');
  const [selectedTest, setSelectedTest] = useState(
    selectedPackageDropdown || TEST_DROPDOWN_OPTIONS[0]
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [areaOrPincode, setAreaOrPincode] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [paymentPreference, setPaymentPreference] = useState<'upi' | 'store'>('store');
  const [transactionRef, setTransactionRef] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Optional Prescription File state
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedRequestId, setSavedRequestId] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submittedDetails, setSubmittedDetails] = useState<{
    id: string;
    name: string;
    phone: string;
    gender: string;
    age: number;
    test: string;
    date: string;
    timeSlot: string;
    areaOrPincode: string;
    payment: string;
    amount?: number;
    transactionRef?: string;
    address: string;
    hasPrescription: boolean;
  } | null>(null);

  // Today's date string YYYY-MM-DD for min date
  const todayString = new Date().toISOString().split('T')[0];

  // Update selected test if parent updates it (e.g. from Package card "Request package" button)
  useEffect(() => {
    if (selectedPackageDropdown) {
      setSelectedTest(selectedPackageDropdown);
    }
  }, [selectedPackageDropdown]);

  // Is current test eligible for online UPI?
  const isPricedPackage = Boolean(PRICED_PACKAGES_MAP[selectedTest]);
  const currentPackageDetails = PRICED_PACKAGES_MAP[selectedTest];

  // If selected test is changed to non-package test, ensure payment preference is store
  useEffect(() => {
    if (!isPricedPackage && paymentPreference === 'upi') {
      setPaymentPreference('store');
    }
  }, [isPricedPackage, paymentPreference]);

  const copyUpiId = () => {
    navigator.clipboard.writeText(activeUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrescriptionError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Allowed types: JPG, PNG, PDF
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setPrescriptionError(t('Please select a JPG, PNG, or PDF file.', 'कृपया केवल JPG, PNG अथवा PDF फाइल चुनें।'));
      return;
    }

    // Max 5 MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setPrescriptionError(t('Prescription file size must be less than 5 MB.', 'पर्ची की फाइल 5 MB से कम होनी चाहिए।'));
      return;
    }

    setPrescriptionFile(file);
  };

  const handleResetForm = () => {
    setName('');
    setPhone('');
    setGender('');
    setAge('');
    setSelectedTest(selectedPackageDropdown || TEST_DROPDOWN_OPTIONS[0]);
    setPreferredDate('');
    setTimeSlot(TIME_SLOTS[0]);
    setAreaOrPincode('');
    setAddress('');
    setMessage('');
    setPaymentPreference('store');
    setTransactionRef('');
    setConsentAgreed(false);
    setPrescriptionFile(null);
    setPrescriptionError(null);
    setErrors({});
    setSubmitted(false);
    setSaveError(null);
    setSavedRequestId(null);
    setSubmittedDetails(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = t('Please enter your full name.', 'कृपया अपना नाम दर्ज करें।');
    }

    // Phone validation: must be 10 digits
    const cleanedPhone = phone.replace(/\D/g, '');
    if (!cleanedPhone) {
      errs.phone = t('Please enter your 10-digit mobile number.', 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।');
    } else if (cleanedPhone.length < 10) {
      errs.phone = t('Mobile number must be at least 10 digits.', 'मोबाइल नंबर 10 अंकों का होना आवश्यक है।');
    }

    if (!gender) {
      errs.gender = t('Please select a gender.', 'कृपया लिंग का चयन करें।');
    }

    if (!age || Number(age) <= 0 || Number(age) > 120) {
      errs.age = t('Please enter a valid age.', 'कृपया मान्य आयु दर्ज करें।');
    }

    if (!selectedTest) {
      errs.selectedTest = t('Please select a test or package.', 'कृपया जांच अथवा पैकेज चुनें।');
    }

    if (!preferredDate) {
      errs.preferredDate = t('Please choose a preferred collection date.', 'कृपया संग्रह तिथि चुनें।');
    }

    if (!address.trim()) {
      errs.address = t('Please enter your collection address.', 'कृपया सैंपल कलेक्शन का पता दर्ज करें।');
    }

    if (!consentAgreed) {
      errs.consent = t(
        'You must agree to the Privacy Policy and consent to contact before submitting.',
        'सबमिट करने से पूर्व आपको सहमति देना आवश्यक है।'
      );
    }

    if (paymentPreference === 'upi' && !transactionRef.trim()) {
      errs.transactionRef = t(
        'Please enter your UPI transaction reference / UTR ID after payment.',
        'कृपया भुगतान के बाद UPI ट्रांजैक्शन रेफरेंस / UTR नंबर दर्ज करें।'
      );
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const cleanedPhone = phone.replace(/[^\d+]/g, '');

    try {
      const assignedRefId = await storePatientBookingRequest({
        patientName: name.trim(),
        phone: cleanedPhone,
        gender: gender as any,
        age: Number(age),
        testOrPackage: selectedTest,
        preferredDate,
        timeSlot,
        areaOrPincode: areaOrPincode.trim(),
        consentAgreed,
        paymentChoice: paymentPreference,
        transactionRef: transactionRef.trim(),
        collectionAddress: address.trim(),
        additionalMessage: message.trim(),
        prescriptionFile
      });

      setSavedRequestId(assignedRefId);
      setSubmittedDetails({
        id: assignedRefId,
        name: name.trim(),
        phone: cleanedPhone,
        gender: String(gender),
        age: Number(age),
        test: selectedTest,
        date: preferredDate,
        timeSlot,
        areaOrPincode: areaOrPincode.trim(),
        payment: paymentPreference,
        amount: currentPackageDetails?.price,
        transactionRef: transactionRef.trim(),
        address: address.trim(),
        hasPrescription: Boolean(prescriptionFile)
      });
      setSubmitted(true);
    } catch (saveErr: any) {
      console.error('Failed to record booking in Firestore:', saveErr);
      setSaveError(
        t(
          'Could not record booking to the database. Please check your internet connection and try again, or call our lab directly at ' + LAB_DETAILS.phoneDisplay + '.',
          'डेटाबेस में बुकिंग दर्ज करने में त्रुटि आई। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें, या सीधे ' + LAB_DETAILS.phoneDisplay + ' पर कॉल करें।'
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  // WhatsApp prefilled message builder
  const buildWhatsAppMessage = () => {
    if (!submittedDetails) return LAB_DETAILS.whatsappDefaultLink;
    const lines = [
      `Hello Bharat Pathology,`,
      `I have submitted a home collection request on your website.`,
      `• Ref ID: ${submittedDetails.id}`,
      `• Patient: ${submittedDetails.name} (${submittedDetails.gender}, ${submittedDetails.age} yrs)`,
      `• Mobile: ${submittedDetails.phone}`,
      `• Test/Package: ${submittedDetails.test}`,
      `• Preferred Date: ${submittedDetails.date}`,
      `• Time Window: ${submittedDetails.timeSlot}`,
      submittedDetails.areaOrPincode ? `• Area / Pincode: ${submittedDetails.areaOrPincode}` : '',
      `• Address: ${submittedDetails.address}`,
      submittedDetails.hasPrescription ? `• Prescription: Attached in web request` : '',
      submittedDetails.payment === 'upi' ? `• Payment: UPI Paid (UTR: ${submittedDetails.transactionRef})` : `• Payment: Pay at Lab / Cash on collection`
    ].filter(Boolean);

    const encoded = encodeURIComponent(lines.join('\n'));
    return `${LAB_DETAILS.whatsappBaseUrl}?text=${encoded}`;
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-slate-50/80 border-b border-slate-200/60 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-600 mb-2">
            {t('Contact & Home Collection Request', 'संपर्क एवं होम कलेक्शन अनुरोध')}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('Ready to request home collection?', 'होम सैंपल कलेक्शन का अनुरोध करने के लिए तैयार हैं?')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-normal">
            {t(
              'Fill out the form below to book home collection directly with our lab, or reach out to our team directly by phone.',
              'होम सैंपल कलेक्शन बुक करने के लिए नीचे दिया गया फॉर्म भरें, या सीधे फोन करके बात करें।'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Direct Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Call Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t('Direct Phone Support', 'सीधा फोन हेल्पलाइन')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {t('Speak directly with our sample coordinator in Ballia.', 'बलिया स्थित हमारे सैंपल समन्वयक से सीधे बात करें।')}
                  </p>
                  <a
                    href={telLink}
                    className="inline-flex items-center gap-2 mt-3 text-base font-bold text-teal-700 hover:text-teal-800"
                  >
                    <span>{settings.phone || LAB_DETAILS.phoneDisplay}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t('Official WhatsApp', 'आधिकारिक व्हाट्सएप')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {t('Enquire, send prescriptions, or request sample visits.', 'पूछताछ करें, पर्ची भेजें, अथवा सैंपल विजिट हेतु संदेश दें।')}
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-sm font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>{t('Chat with Bharat Pathology', 'व्हाट्सएप पर बात करें')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t('Laboratory Hours', 'लैब खुलने का समय')}
                  </h3>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {t(settings.hours || LAB_DETAILS.hours, LAB_DETAILS.hindiHours)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('Open all 7 days of the week', 'सप्ताह के सातों दिन सेवा उपलब्ध')}
                  </p>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t('Physical Address', 'लैब का पता')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium leading-relaxed">
                    {t(settings.address || LAB_DETAILS.address, LAB_DETAILS.hindiAddress)}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Booking Request Form */}
          <div id="booking-form" className="lg:col-span-7 scroll-mt-24">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8">
              
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {t('Home Collection Booking Form', 'होम कलेक्शन बुकिंग फॉर्म')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {t(
                    'Submit your request directly to our laboratory system. Our team will review it immediately.',
                    'सीधे हमारे लैब सिस्टम में अपना अनुरोध सबमिट करें। हमारी टीम तुरंत इसकी समीक्षा करेगी।'
                  )}
                </p>
              </div>

              {/* Confirmation / Success Screen per Requirement C5 */}
              {submitted ? (
                <div className="p-6 sm:p-8 rounded-2xl bg-teal-50/90 border border-teal-200 text-teal-950 space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 mb-2">
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('Request Submitted Successfully', 'अनुरोध सफलतापूर्वक दर्ज')}</span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                        {t('Booking Request Received!', 'बुकिंग अनुरोध प्राप्त हुआ!')}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        {t(
                          'Your request has been securely recorded. Please note: This is a request, not a confirmed booking. Our lab team will call you to confirm technician availability and collection timing.',
                          'आपका अनुरोध सुरक्षित रूप से दर्ज कर लिया गया है। कृपया ध्यान दें: यह एक अनुरोध है, अंतिम पुष्टि नहीं। हमारी लैब टीम समय और तकनीशियन की उपलब्धता की पुष्टि के लिए आपसे फोन पर संपर्क करेगी।'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Short Booking Reference ID Card */}
                  {savedRequestId && (
                    <div className="p-4 rounded-xl bg-white border border-teal-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <span className="text-xs text-slate-500 font-medium block">
                          {t('Booking Reference Number (Short ID)', 'बुकिंग रेफरेंस नंबर')}
                        </span>
                        <span className="font-mono font-bold text-lg sm:text-xl text-teal-800 tracking-wider select-all">
                          {savedRequestId}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold">
                        <Database className="w-4 h-4 text-teal-600" />
                        <span>Status: New Request</span>
                      </div>
                    </div>
                  )}

                  {/* Summary Box */}
                  {submittedDetails && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs sm:text-sm text-slate-700">
                      <div className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                        <span>{t('Request Summary', 'अनुरोध सारांश')}</span>
                        <span className="text-xs text-teal-700 font-semibold">
                          {submittedDetails.date} ({submittedDetails.timeSlot})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">{t('Patient:', 'मरीज:')}</span>{' '}
                          <span className="font-semibold text-slate-900">{submittedDetails.name} ({submittedDetails.gender}, {submittedDetails.age} yrs)</span>
                        </div>
                        <div>
                          <span className="text-slate-500">{t('Phone:', 'मोबाइल:')}</span>{' '}
                          <span className="font-semibold text-slate-900">{submittedDetails.phone}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-slate-500">{t('Test / Package:', 'जांच / पैकेज:')}</span>{' '}
                          <span className="font-semibold text-slate-900">{submittedDetails.test}</span>
                        </div>
                        {submittedDetails.areaOrPincode && (
                          <div>
                            <span className="text-slate-500">{t('Area/Pincode:', 'क्षेत्र/पिनकोड:')}</span>{' '}
                            <span className="font-semibold text-slate-900">{submittedDetails.areaOrPincode}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-500">{t('Payment Choice:', 'भुगतान:')}</span>{' '}
                          <span className="font-semibold text-slate-900">
                            {submittedDetails.payment === 'upi'
                              ? `Online UPI (₹${submittedDetails.amount || 0})`
                              : t('Pay at Lab / Collection', 'लैब या कलेक्शन पर भुगतान')}
                          </span>
                        </div>
                        {submittedDetails.hasPrescription && (
                          <div className="sm:col-span-2 text-teal-700 font-medium">
                            ✓ {t('Prescription document attached securely', 'डॉक्टर का पर्चा सुरक्षित रूप से संलग्न है')}
                          </div>
                        )}
                        <div className="sm:col-span-2">
                          <span className="text-slate-500">{t('Address:', 'पता:')}</span>{' '}
                          <span className="text-slate-800">{submittedDetails.address}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* What happens next note */}
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-900 mb-0.5">
                        {t('Important Confirmation Note:', 'महत्वपूर्ण सूचना:')}
                      </span>
                      <span>
                        {t(
                          'This is a request, not a confirmed booking. Our sample coordinator will call you to confirm sample timing, preparation guidelines, and collection details.',
                          'यह केवल एक अनुरोध है, अंतिम पुष्टि नहीं। हमारे सैंपल समन्वयक समय, आवश्यक तैयारी और कलेक्शन विवरण की पुष्टि हेतु आपसे संपर्क करेंगे।'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Buttons for Call and WhatsApp per Requirement C5 */}
                  <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <a
                        href={buildWhatsAppMessage()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all min-h-[44px]"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{t('Send to Lab WhatsApp', 'व्हाट्सएप पर विवरण भेजें')}</span>
                      </a>

                      <a
                        href={telLink}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-all min-h-[44px]"
                      >
                        <Phone className="w-4 h-4 text-teal-600" />
                        <span>{t('Call Coordinator', 'समन्वयक को कॉल करें')}</span>
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer py-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('Book Another Test', 'अन्य टेस्ट बुक करें')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  
                  {/* Save Error Alert if any */}
                  {saveError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">{t('Submission Error', 'सबमिशन में त्रुटि')}</span>
                        <span>{saveError}</span>
                      </div>
                    </div>
                  )}

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {t('Your Name *', 'आपका नाम *')}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                        placeholder={t('e.g. Ramesh Kumar', 'उदा. रमेश कुमार')}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                          errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                        }`}
                      />
                      {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {t('Phone Number (10 digits) *', 'मोबाइल नंबर (10 अंक) *')}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        placeholder="e.g. 9876543210"
                        maxLength={14}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                          errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                        }`}
                      />
                      {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Gender & Age */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {t('Gender *', 'लिंग *')}
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => {
                          setGender(e.target.value as any);
                          if (errors.gender) setErrors({ ...errors, gender: '' });
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                          errors.gender ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <option value="">{t('-- Select Gender --', '-- लिंग चुनें --')}</option>
                        <option value="Female">{t('Female', 'महिला')}</option>
                        <option value="Male">{t('Male', 'पुरुष')}</option>
                        <option value="Other">{t('Other', 'अन्य')}</option>
                        <option value="Prefer not to say">{t('Prefer not to say', 'बताना नहीं चाहते')}</option>
                      </select>
                      {errors.gender && <p className="text-xs text-rose-500 mt-1">{errors.gender}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {t('Age *', 'आयु (वर्ष) *')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={age}
                        onChange={(e) => {
                          setAge(e.target.value);
                          if (errors.age) setErrors({ ...errors, age: '' });
                        }}
                        placeholder={t('e.g. 45', 'उदा. 45')}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                          errors.age ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                        }`}
                      />
                      {errors.age && <p className="text-xs text-rose-500 mt-1">{errors.age}</p>}
                    </div>
                  </div>

                  {/* Test / Package Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('Test or package requested *', 'वांछित टेस्ट अथवा हेल्थ पैकेज *')}
                    </label>
                    <select
                      value={selectedTest}
                      onChange={(e) => {
                        setSelectedTest(e.target.value);
                        if (errors.selectedTest) setErrors({ ...errors, selectedTest: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                        errors.selectedTest ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      {TEST_DROPDOWN_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {isPricedPackage && (
                      <p className="text-xs text-teal-700 font-medium mt-1">
                        {t(
                          `Listed preventive package: ₹${currentPackageDetails?.price} (Direct UPI option available)`,
                          `सूचीबद्ध निवारक पैकेज: ₹${currentPackageDetails?.price} (डायरेक्ट UPI विकल्प उपलब्ध)`
                        )}
                      </p>
                    )}
                    {errors.selectedTest && <p className="text-xs text-rose-500 mt-1">{errors.selectedTest}</p>}
                  </div>

                  {/* Preferred Date & Preferred Time Slot (Requirement C2) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {t('Preferred Collection Date *', 'सैंपल कलेक्शन की तारीख *')}
                      </label>
                      <input
                        type="date"
                        min={todayString}
                        value={preferredDate}
                        onChange={(e) => {
                          setPreferredDate(e.target.value);
                          if (errors.preferredDate) setErrors({ ...errors, preferredDate: '' });
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                          errors.preferredDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                        }`}
                      />
                      {errors.preferredDate && <p className="text-xs text-rose-500 mt-1">{errors.preferredDate}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {t('Preferred Time Slot *', 'सुविधाजनक समय स्लॉट *')}
                      </label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Area / Pincode field (Requirement C2) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('Area / Locality / Pincode', 'इलाका / गांव / पिनकोड')}
                    </label>
                    <input
                      type="text"
                      value={areaOrPincode}
                      onChange={(e) => setAreaOrPincode(e.target.value)}
                      placeholder={t('e.g. Bhimpura No. 1, 221716 or nearby locality', 'उदा. भीमपुरा नं. 1, 221716 अथवा नजदीकी गांव')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    />
                  </div>

                  {/* Collection Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('Detailed Collection Address *', 'सैंपल कलेक्शन का पूरा पता *')}
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors({ ...errors, address: '' });
                      }}
                      placeholder={t(
                        'House/Plot number, village/locality, landmark in Bhimpura or nearby Ballia',
                        'मकान/प्लॉट नंबर, गांव/मोहल्ला, लैंडमार्क (भीमपुरा या आसपास का क्षेत्र)'
                      )}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                        errors.address ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                      }`}
                    ></textarea>
                    {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address}</p>}
                  </div>

                  {/* Optional Prescription Upload (Requirement C2) */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {t('Upload Doctor Prescription (Optional, JPG, PNG or PDF, max 5 MB)', 'डॉक्टर का पर्चा अपलोड करें (वैकल्पिक, JPG, PNG या PDF, अधिकतम 5 MB)')}
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-teal-500 bg-white hover:bg-teal-50/50 text-teal-800 font-semibold text-xs cursor-pointer transition-all min-h-[44px]">
                        <Upload className="w-4 h-4 text-teal-600" />
                        <span>{prescriptionFile ? t('Change Prescription', 'पर्चा बदलें') : t('Select File', 'फाइल चुनें')}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      {prescriptionFile && (
                        <div className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[180px]">{prescriptionFile.name}</span>
                          <button
                            type="button"
                            onClick={() => setPrescriptionFile(null)}
                            className="text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {prescriptionError && (
                      <p className="text-xs text-rose-500">{prescriptionError}</p>
                    )}
                    <p className="text-[11px] text-slate-500">
                      {t('Files are stored securely and reviewed only by authorized lab personnel.', 'फाइलें सुरक्षित रूप से संग्रहीत की जाती हैं और केवल अधिकृत लैब स्टाफ द्वारा देखी जाती हैं।')}
                    </p>
                  </div>

                  {/* Payment Preference */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {t('Payment Preference', 'भुगतान विकल्प')}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Pay at Lab option */}
                      <label
                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                          paymentPreference === 'store'
                            ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-500/20'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentPreference"
                          value="store"
                          checked={paymentPreference === 'store'}
                          onChange={() => setPaymentPreference('store')}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <div className="text-xs">
                          <span className="font-bold block text-slate-900">
                            {t('Pay at Lab / on Collection', 'लैब अथवा कलेक्शन के समय भुगतान')}
                          </span>
                          <span className="text-slate-500">
                            {t('Confirm fee with staff at visit', 'विजिट पर स्टाफ से शुल्क सुनिश्चित करें')}
                          </span>
                        </div>
                      </label>

                      {/* UPI Option */}
                      <label
                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                          !isPricedPackage ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
                        } ${
                          paymentPreference === 'upi'
                            ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-500/20'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentPreference"
                          value="upi"
                          disabled={!isPricedPackage}
                          checked={paymentPreference === 'upi'}
                          onChange={() => setPaymentPreference('upi')}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <div className="text-xs">
                          <span className="font-bold block text-slate-900">
                            {t('Direct UPI (Fixed Packages Only)', 'सीधा UPI (केवल निश्चित पैकेज)')}
                          </span>
                          <span className="text-slate-500">
                            {isPricedPackage
                              ? `Pay ₹${currentPackageDetails?.price} via UPI`
                              : t('Available only for listed packages', 'केवल निश्चित पैकेज हेतु उपलब्ध')}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* UPI Payment Box if UPI selected */}
                  {paymentPreference === 'upi' && isPricedPackage && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 border border-teal-200/90 space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                        <CreditCard className="w-4 h-4" />
                        <span>{t('Direct UPI Payment Instructions', 'सीधे UPI भुगतान निर्देश')}</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs leading-relaxed flex items-start gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block mb-0.5">
                            {t('Payee Verification Warning:', 'प्राप्तकर्ता नाम सत्यापन सूचना:')}
                          </span>
                          <span>
                            {t(
                              `Verify that the payee name shown in your payment app is strictly "${activePayeeName}". If any different name appears, do not pay and call Bharat Pathology directly.`,
                              `अपने भुगतान ऐप में अवश्य जांचें कि प्राप्तकर्ता का नाम "${activePayeeName}" ही आ रहा है। यदि कोई भिन्न नाम आए, तो भुगतान न करें और सीधे भारत पैथोलॉजी से संपर्क करें।`
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-teal-100">
                          <span className="text-slate-500 block mb-0.5">{t('Amount to Transfer:', 'भुगतान राशि:')}</span>
                          <span className="text-lg font-extrabold text-teal-800">₹{currentPackageDetails?.price}</span>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-teal-100 flex items-center justify-between">
                          <div>
                            <span className="text-slate-500 block mb-0.5">{t('Verified UPI VPA:', 'सत्यापित UPI ID:')}</span>
                            <span className="font-mono font-bold text-slate-800 text-xs">{activeUpiId}</span>
                          </div>
                          <button
                            type="button"
                            onClick={copyUpiId}
                            className="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          {t('Transaction Reference / UTR Number *', 'ट्रांजैक्शन रेफरेंस / UTR नंबर *')}
                        </label>
                        <input
                          type="text"
                          value={transactionRef}
                          onChange={(e) => {
                            setTransactionRef(e.target.value);
                            if (errors.transactionRef) setErrors({ ...errors, transactionRef: '' });
                          }}
                          placeholder={t('e.g. 12-digit UPI reference number', 'उदा. 12 अंकों का UPI रेफरेंस नंबर')}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            errors.transactionRef ? 'border-rose-400' : 'border-slate-300'
                          }`}
                        />
                        {errors.transactionRef && (
                          <p className="text-xs text-rose-500 mt-1">{errors.transactionRef}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Message (optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('Additional Message (Optional)', 'अतिरिक्त संदेश (वैकल्पिक)')}
                    </label>
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t(
                        'Any specific doctor notes, fasting status, or specific instructions',
                        'डॉक्टर की विशेष सलाह, फास्टिंग स्थिति, अथवा विशेष निर्देश'
                      )}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    ></textarea>
                  </div>

                  {/* Required Consent Checkbox per Requirement C2 */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentAgreed}
                        onChange={(e) => {
                          setConsentAgreed(e.target.checked);
                          if (errors.consent) setErrors({ ...errors, consent: '' });
                        }}
                        className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed font-normal">
                        {t(
                          'I agree to the ',
                          'मैं '
                        )}
                        <Link to="/privacy-policy" className="text-teal-700 underline font-semibold hover:text-teal-800">
                          {t('Privacy Policy', 'गोपनीयता नीति')}
                        </Link>
                        {t(
                          ' and consent to Bharat Pathology contacting me by phone or WhatsApp regarding this collection request.',
                          ' से सहमत हूँ और इस कलेक्शन अनुरोध हेतु भारत पैथोलॉजी द्वारा संपर्क किए जाने की सहमति देता/देती हूँ।'
                        )}
                        <span className="text-rose-500 font-bold ml-0.5">*</span>
                      </span>
                    </label>
                    {errors.consent && <p className="text-xs text-rose-500 mt-1">{errors.consent}</p>}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-4 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer min-h-[48px]"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{t('Submitting Request...', 'अनुरोध दर्ज किया जा रहा है...')}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>{t('Confirm & Submit Request', 'अनुरोध दर्ज करें (सबमिट करें)')}</span>
                        </>
                      )}
                    </button>

                    <p className="text-center text-[11px] text-slate-500 mt-2.5">
                      {t(
                        'Your request is sent directly to Bharat Pathology. Our staff reviews it and will call you to confirm timing.',
                        'आपका अनुरोध सीधे भारत पैथोलॉजी में दर्ज होता है। हमारे कर्मचारी समीक्षा के बाद समय की पुष्टि हेतु कॉल करेंगे।'
                      )}
                    </p>
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
