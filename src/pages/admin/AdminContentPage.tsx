import React, { useState, useEffect } from 'react';
import { LabSettings, WebsiteTheme } from '../../types/admin';
import { updateLabSettings } from '../../lib/adminFirestore';
import { useAdminAuth } from '../../lib/adminAuth';
import { THEME_PRESETS } from '../../context/LabSettingsContext';
import {
  FileText,
  Save,
  Eye,
  Megaphone,
  CheckCircle2,
  HelpCircle,
  Package,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Palette,
  Phone,
  Clock,
  MapPin,
  Tag,
  Smartphone,
  ShieldCheck,
  Award,
  Sparkles,
  Layers
} from 'lucide-react';
import { HEALTH_PACKAGES, TEST_DROPDOWN_OPTIONS, FAQS_DATA } from '../../data';

interface AdminContentPageProps {
  settings: LabSettings;
}

export const AdminContentPage: React.FC<AdminContentPageProps> = ({ settings }) => {
  const { adminData, isOwner, user } = useAdminAuth();

  // Active theme state
  const [selectedTheme, setSelectedTheme] = useState<WebsiteTheme>(settings.theme || 'teal');

  // Announcement state
  const [announcementActive, setAnnouncementActive] = useState(settings.announcementActive || false);
  const [announcementText, setAnnouncementText] = useState(settings.announcementText || '');
  const [announcementType, setAnnouncementType] = useState<'info' | 'alert' | 'offer'>(settings.announcementType || 'info');

  // Hero section live text
  const [heroHeadline, setHeroHeadline] = useState(settings.heroHeadline || 'Pathology testing, closer to home.');
  const [heroHeadlineHi, setHeroHeadlineHi] = useState(settings.heroHeadlineHi || 'विश्वसनीय पैथोलॉजी जांच, आपके घर के करीब।');
  const [heroSubhead, setHeroSubhead] = useState(settings.heroSubhead || 'Local laboratory testing and home sample collection from Bharat Pathology on Balauli Road, Bhimpura No. 1.');
  const [heroSubheadHi, setHeroSubheadHi] = useState(settings.heroSubheadHi || 'बलौली रोड, भीमपुरा नं. 1 स्थित भारत पैथोलॉजी द्वारा स्थानीय लैब परीक्षण एवं घर से सैंपल कलेक्शन की विश्वसनीय सुविधा।');
  const [badgeText, setBadgeText] = useState(settings.badgeText || 'Local Pathology Laboratory in Ballia');
  const [badgeTextHi, setBadgeTextHi] = useState(settings.badgeTextHi || 'बलिया में स्थानीय पैथोलॉजी प्रयोगशाला');

  // Contact facts & working timings
  const [labHours, setLabHours] = useState(settings.hours || '');
  const [labPhone, setLabPhone] = useState(settings.phone || '');
  const [labWhatsapp, setLabWhatsapp] = useState(settings.whatsapp || '');
  const [emergencyPhone, setEmergencyPhone] = useState(settings.emergencyPhone || '');
  const [labAddress, setLabAddress] = useState(settings.address || '');

  // Pricing & Collection rules
  const [defaultCollectionCharge, setDefaultCollectionCharge] = useState(Number(settings.defaultCollectionCharge) || 0);
  const [freeThreshold, setFreeThreshold] = useState(Number(settings.freeHomeCollectionThreshold) || 500);
  const [discountNotice, setDiscountNotice] = useState(settings.discountNotice || '₹0 Collection fee for nearby localities & seniors.');

  // Credentials
  const [labInchargeName, setLabInchargeName] = useState(settings.labInchargeName || '');
  const [qualification, setQualification] = useState(settings.qualification || '');
  const [registrationNumber, setRegistrationNumber] = useState(settings.registrationNumber || '');
  const [nablStatus, setNablStatus] = useState(settings.nablStatus || '');

  // SMS Gateway Webhook
  const [smsGatewayUrl, setSmsGatewayUrl] = useState(settings.smsGatewayUrl || '');

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync state when remote settings change
  useEffect(() => {
    if (settings) {
      setSelectedTheme(settings.theme || 'teal');
      setAnnouncementActive(Boolean(settings.announcementActive));
      setAnnouncementText(settings.announcementText || '');
      setAnnouncementType(settings.announcementType || 'info');
      setHeroHeadline(settings.heroHeadline || 'Pathology testing, closer to home.');
      setHeroHeadlineHi(settings.heroHeadlineHi || 'विश्वसनीय पैथोलॉजी जांच, आपके घर के करीब।');
      setHeroSubhead(settings.heroSubhead || 'Local laboratory testing and home sample collection from Bharat Pathology on Balauli Road, Bhimpura No. 1.');
      setHeroSubheadHi(settings.heroSubheadHi || 'बलौली रोड, भीमपुरा नं. 1 स्थित भारत पैथोलॉजी द्वारा स्थानीय लैब परीक्षण एवं घर से सैंपल कलेक्शन की विश्वसनीय सुविधा।');
      setBadgeText(settings.badgeText || 'Local Pathology Laboratory in Ballia');
      setBadgeTextHi(settings.badgeTextHi || 'बलिया में स्थानीय पैथोलॉजी प्रयोगशाला');
      setLabHours(settings.hours || '');
      setLabPhone(settings.phone || '');
      setLabWhatsapp(settings.whatsapp || '');
      setEmergencyPhone(settings.emergencyPhone || '');
      setLabAddress(settings.address || '');
      setDefaultCollectionCharge(Number(settings.defaultCollectionCharge) || 0);
      setFreeThreshold(Number(settings.freeHomeCollectionThreshold) || 500);
      setDiscountNotice(settings.discountNotice || '₹0 Collection fee for nearby localities & seniors.');
      setLabInchargeName(settings.labInchargeName || '');
      setQualification(settings.qualification || '');
      setRegistrationNumber(settings.registrationNumber || '');
      setNablStatus(settings.nablStatus || '');
      setSmsGatewayUrl(settings.smsGatewayUrl || '');
    }
  }, [settings]);

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Instant Theme Preview handler
  const handleSelectTheme = (themeId: WebsiteTheme) => {
    setSelectedTheme(themeId);
    // Instant local preview by setting data-theme on document
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const handleSaveCMS = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const actorName = adminData?.name || user?.email || 'Owner';
      const actorEmail = adminData?.email || user?.email || 'owner@bharatpathology.in';

      const updatedPayload: LabSettings = {
        ...settings,
        theme: selectedTheme,
        announcementActive,
        announcementText: announcementText.trim(),
        announcementType,
        heroHeadline: heroHeadline.trim(),
        heroHeadlineHi: heroHeadlineHi.trim(),
        heroSubhead: heroSubhead.trim(),
        heroSubheadHi: heroSubheadHi.trim(),
        badgeText: badgeText.trim(),
        badgeTextHi: badgeTextHi.trim(),
        hours: labHours.trim(),
        phone: labPhone.trim(),
        whatsapp: labWhatsapp.trim(),
        emergencyPhone: emergencyPhone.trim(),
        address: labAddress.trim(),
        defaultCollectionCharge: Number(defaultCollectionCharge) || 0,
        freeHomeCollectionThreshold: Number(freeThreshold) || 0,
        discountNotice: discountNotice.trim(),
        labInchargeName: labInchargeName.trim(),
        qualification: qualification.trim(),
        registrationNumber: registrationNumber.trim(),
        nablStatus: nablStatus.trim(),
        smsGatewayUrl: smsGatewayUrl.trim()
      };

      await updateLabSettings(updatedPayload, { name: actorName, email: actorEmail });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4500);
    } catch (err: any) {
      console.error('Failed to save CMS settings:', err);
      setSaveError(err?.message || 'Failed to publish changes. Check permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Real-time Live Website Editor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Public Website CMS & 5-Theme Switcher</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose from 5 distinct color themes and customize live banners, headlines, contact numbers, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer min-h-[44px]"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Mode</span>
          </button>

          <button
            onClick={handleSaveCMS}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-md cursor-pointer min-h-[44px] transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Publish Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save feedback notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">Theme & Website Content Published Successfully!</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              The new color theme, headlines, announcements, and contact information are now live across the public site.
            </p>
          </div>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* SECTION 1: 5 DISTINCT COLOR THEMES SELECTOR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              <Palette className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">Website Theme Switcher (5 Hand-Crafted Palettes)</h2>
              <p className="text-xs text-slate-500">
                Click any theme below to preview and apply it instantly across the entire public website.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Active: <strong className="capitalize text-teal-600 dark:text-teal-400">{selectedTheme}</strong>
          </span>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {THEME_PRESETS.map((preset) => {
            const isSelected = selectedTheme === preset.id;

            return (
              <div
                key={preset.id}
                onClick={() => handleSelectTheme(preset.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left relative overflow-hidden group ${
                  isSelected
                    ? 'border-teal-600 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/40 shadow-md ring-2 ring-teal-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Active Checkmark Pill */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </div>
                )}

                <div>
                  {/* Swatch preview circles */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-7 h-7 rounded-full shadow-xs border border-white/40 flex items-center justify-center text-white"
                      style={{ backgroundColor: preset.primaryColor }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div
                      className="w-5 h-5 rounded-full shadow-xs opacity-80"
                      style={{ backgroundColor: preset.accentColor }}
                    />
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                    {preset.name}
                  </h3>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {preset.nameHi}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold">
                  <span
                    className="inline-block px-2.5 py-1 rounded-lg text-white font-mono text-[10px]"
                    style={{ backgroundColor: preset.primaryColor }}
                  >
                    Select Palette
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: HERO SECTION COPY (EN & HI) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg">Homepage Hero Section Text (Bilingual Live Edit)</h2>
            <p className="text-xs text-slate-500">
              Customize the main headline, subtitle, and trust badge seen by all visitors when the page loads.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div>
            <label className="font-bold block mb-1">Hero Headline (English)</label>
            <input
              type="text"
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              placeholder="Pathology testing, closer to home."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-xs"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Hero Headline (Hindi - हिंदी)</label>
            <input
              type="text"
              value={heroHeadlineHi}
              onChange={(e) => setHeroHeadlineHi(e.target.value)}
              placeholder="विश्वसनीय पैथोलॉजी जांच, आपके घर के करीब।"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-xs"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Hero Subtitle (English)</label>
            <textarea
              rows={2}
              value={heroSubhead}
              onChange={(e) => setHeroSubhead(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Hero Subtitle (Hindi - हिंदी)</label>
            <textarea
              rows={2}
              value={heroSubheadHi}
              onChange={(e) => setHeroSubheadHi(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Hero Badge Text (English)</label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Hero Badge Text (Hindi - हिंदी)</label>
            <input
              type="text"
              value={badgeTextHi}
              onChange={(e) => setBadgeTextHi(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: ANNOUNCEMENT BANNER CMS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="font-bold text-base sm:text-lg">Site-wide Emergency or Announcement Top Banner</h2>
              <p className="text-xs text-slate-500">
                Display holiday notices, free health screening camps, or emergency alerts across the header.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800">
            <span>Show Banner:</span>
            <input
              type="checkbox"
              checked={announcementActive}
              onChange={(e) => setAnnouncementActive(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 cursor-pointer"
            />
          </label>
        </div>

        <div className="space-y-3 pt-1">
          <textarea
            rows={2}
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="e.g. Free Blood Sugar & Thyroid screening camp this Sunday at Bharat Pathology, Bhimpura No. 1."
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
          />

          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-slate-500">Banner Type:</span>
            {(['info', 'alert', 'offer'] as const).map((type) => (
              <label key={type} className="inline-flex items-center gap-1.5 cursor-pointer capitalize">
                <input
                  type="radio"
                  name="announcementType"
                  value={type}
                  checked={announcementType === type}
                  onChange={() => setAnnouncementType(type)}
                  className="text-teal-600 cursor-pointer"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: CONTACT & EMERGENCY HELPLINE OVERRIDES */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Phone className="w-5 h-5 text-teal-600" />
          <div>
            <h2 className="font-bold text-base sm:text-lg">Contact Facts, Helplines & Operating Hours</h2>
            <p className="text-xs text-slate-500">
              Numbers and addresses updated here reflect automatically in the TopBar, Header, Footer, and Floating WhatsApp buttons.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div>
            <label className="font-bold block mb-1">Primary Helpline Phone</label>
            <input
              type="text"
              value={labPhone}
              onChange={(e) => setLabPhone(e.target.value)}
              placeholder="+91 88877 90574"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">WhatsApp Chat Number</label>
            <input
              type="text"
              value={labWhatsapp}
              onChange={(e) => setLabWhatsapp(e.target.value)}
              placeholder="+91 88877 90574"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">24x7 Emergency Hotline</label>
            <input
              type="text"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="+91 88877 90574"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Laboratory Operating Hours</label>
            <input
              type="text"
              value={labHours}
              onChange={(e) => setLabHours(e.target.value)}
              placeholder="Open All 7 Days: 06:30 AM – 08:30 PM"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-bold block mb-1">Full Physical Laboratory Address</label>
            <input
              type="text"
              value={labAddress}
              onChange={(e) => setLabAddress(e.target.value)}
              placeholder="Balauli Road, Bhimpura No. 1, Ballia, Uttar Pradesh - 221716"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: PRICING, HOME COLLECTION & DISCOUNTS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Tag className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="font-bold text-base sm:text-lg">Home Collection Fees & Discount Notices</h2>
            <p className="text-xs text-slate-500">
              Configure collection fee waivers, minimum order rules, and special discounts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div>
            <label className="font-bold block mb-1">Default Home Collection Fee (₹)</label>
            <input
              type="number"
              value={defaultCollectionCharge}
              onChange={(e) => setDefaultCollectionCharge(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
            <span className="text-[10px] text-slate-400">Set 0 for free collection</span>
          </div>

          <div>
            <label className="font-bold block mb-1">Free Home Collection Minimum Order (₹)</label>
            <input
              type="number"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
            <span className="text-[10px] text-slate-400">Orders above this have ₹0 collection fee</span>
          </div>

          <div>
            <label className="font-bold block mb-1">Discount / Offer Notice Text</label>
            <input
              type="text"
              value={discountNotice}
              onChange={(e) => setDiscountNotice(e.target.value)}
              placeholder="₹0 Collection fee for seniors & nearby areas"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>
      </div>

      {/* SECTION 6: CREDENTIALS & TRUST CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-amber-600" />
          <div>
            <h2 className="font-bold text-base sm:text-lg">Laboratory Credentials & In-charge Details</h2>
            <p className="text-xs text-slate-500">
              When filled, displays the verified Trust Card badge on the public home page.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
          <div>
            <label className="font-bold block mb-1">Lab In-charge Name</label>
            <input
              type="text"
              value={labInchargeName}
              onChange={(e) => setLabInchargeName(e.target.value)}
              placeholder="e.g. Sanjay Kumar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Qualifications</label>
            <input
              type="text"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              placeholder="e.g. DMLT, Senior Pathologist"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Medical Registration No.</label>
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="e.g. UP/MC/12345"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">NABL / Quality Status</label>
            <input
              type="text"
              value={nablStatus}
              onChange={(e) => setNablStatus(e.target.value)}
              placeholder="e.g. Quality Audited Standards"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>
      </div>

      {/* SECTION 7: SMS GATEWAY & NOTIFICATION INTEGRATION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-5 h-5 text-teal-600" />
          <div>
            <h2 className="font-bold text-base sm:text-lg">Automated Patient SMS Notification Gateway</h2>
            <p className="text-xs text-slate-500">
              Patient confirmation SMS is already supported via 1-click Mobile SMS and WhatsApp. Optionally paste an external SMS Gateway API/webhook URL here.
            </p>
          </div>
        </div>

        <div className="text-xs pt-1">
          <label className="font-bold block mb-1">Optional SMS Gateway API Webhook Endpoint</label>
          <input
            type="url"
            value={smsGatewayUrl}
            onChange={(e) => setSmsGatewayUrl(e.target.value)}
            placeholder="https://api.fast2sms.com/webhook or your custom SMS trigger URL"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            When provided, accepting a booking triggers an automated POST request with patient phone & message payload to this endpoint.
          </p>
        </div>
      </div>

      {/* Save Button Bottom */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveCMS}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg cursor-pointer transition-all"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Publish All to Website</span>
            </>
          )}
        </button>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base">Public Preview of Changes</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="font-bold text-teal-600">Active Theme:</span>{' '}
                <strong className="capitalize">{selectedTheme}</strong>
              </div>

              {announcementActive && (
                <div className="p-3 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center gap-2">
                  <Megaphone className="w-4 h-4 shrink-0" />
                  <span>{announcementText || 'Your announcement will appear here.'}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <div>Headline: <strong>{heroHeadline}</strong></div>
                <div>Hours: <strong>{labHours}</strong></div>
                <div>Phone: <strong>{labPhone}</strong></div>
                <div>Address: <strong>{labAddress}</strong></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
