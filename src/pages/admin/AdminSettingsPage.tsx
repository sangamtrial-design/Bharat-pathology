import React, { useState, useEffect } from 'react';
import { LabSettings, BookingItem } from '../../types/admin';
import { updateLabSettings } from '../../lib/adminFirestore';
import { useAdminAuth } from '../../lib/adminAuth';
import { exportDataToJSON, exportBookingsToCSV } from '../../lib/exportUtils';
import { THEME_PRESETS } from '../../context/LabSettingsContext';
import {
  Settings,
  Save,
  Download,
  Shield,
  Volume2,
  FileSpreadsheet,
  Database,
  Building,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Palette,
  Sparkles
} from 'lucide-react';

interface AdminSettingsPageProps {
  settings: LabSettings;
  bookings: BookingItem[];
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ settings, bookings }) => {
  const { adminData, isOwner, user } = useAdminAuth();

  const [formData, setFormData] = useState<LabSettings>({ ...settings });
  const [maskPhonesInExport, setMaskPhonesInExport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Keep form data synchronized when remote settings change
  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        ...prev,
        ...settings,
        upiId: settings.upiId || prev.upiId,
        upiPayeeName: settings.upiPayeeName || prev.upiPayeeName
      }));
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner && !adminData) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const actorName = adminData?.name || user?.email || 'Owner';
      const actorEmail = adminData?.email || user?.email || 'owner@bharatpathology.in';
      
      await updateLabSettings(formData, { name: actorName, email: actorEmail });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to update lab settings:', err);
      setSaveError(err?.message || 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadBackup = () => {
    const backup = {
      exportTimestamp: new Date().toISOString(),
      labSettings: settings,
      totalBookings: bookings.length,
      bookings: bookings.map((b) => ({
        ...b,
        phone: maskPhonesInExport ? 'XXXXXX' + b.phone.slice(-4) : b.phone
      }))
    };
    exportDataToJSON(backup, 'Bharat_Pathology_Full_Backup');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Laboratory Settings & Backups</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure business identity, receipt headers, default fees, and download secure backups.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Website Color Theme Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-teal-600" />
              <div>
                <h2 className="font-bold text-base">Website Theme Selection (5 Distinct Styles)</h2>
                <p className="text-[11px] text-slate-500">
                  Switch the entire website color aesthetic with 1-click. Saved to cloud database for all visitors.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              Active: <strong className="capitalize">{formData.theme || 'teal'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {THEME_PRESETS.map((preset) => {
              const isSelected = (formData.theme || 'teal') === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    if (isOwner) {
                      setFormData({ ...formData, theme: preset.id });
                      document.documentElement.setAttribute('data-theme', preset.id);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-600 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/40 shadow-sm ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div
                        className="w-5 h-5 rounded-full shadow-xs"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-xs opacity-75"
                        style={{ backgroundColor: preset.accentColor }}
                      />
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {preset.nameHi}
                    </div>
                  </div>

                  <div className="mt-3 text-[10px] font-bold text-slate-500 flex items-center justify-between">
                    <span>{isSelected ? '✓ Selected' : 'Tap to Pick'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lab Identity */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-base">Business & Identity Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold block mb-1">Laboratory Display Name</label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.labName}
                onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Tagline</label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold block mb-1">Full Physical Address</label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Operating Hours</label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Helpline Number</label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Lab Credentials & Certifications (Trust Card) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="font-bold text-base">Lab Credentials & Trust Card</h2>
              <p className="text-[11px] text-slate-500">
                If all fields are empty, the Credentials section remains hidden from the public website. Once filled, it appears as a clean trust card.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold block mb-1">Lab In-charge / Pathologist Name</label>
              <input
                type="text"
                disabled={!isOwner}
                placeholder="OWNER TO FILL (e.g. Dr. Name)"
                value={formData.labInchargeName || ''}
                onChange={(e) => setFormData({ ...formData, labInchargeName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Qualification</label>
              <input
                type="text"
                disabled={!isOwner}
                placeholder="OWNER TO FILL (e.g. MBBS, MD Pathology)"
                value={formData.qualification || ''}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Doctor Registration Number</label>
              <input
                type="text"
                disabled={!isOwner}
                placeholder="OWNER TO FILL (Medical Council Reg No.)"
                value={formData.registrationNumber || ''}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Lab Clinical Registration Number</label>
              <input
                type="text"
                disabled={!isOwner}
                placeholder="OWNER TO FILL (State / Clinical Estb. No.)"
                value={formData.labRegistrationNumber || ''}
                onChange={(e) => setFormData({ ...formData, labRegistrationNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold block mb-1">NABL Accreditation Status</label>
              <input
                type="text"
                disabled={!isOwner}
                placeholder="OWNER TO FILL (e.g. In progress / Certified / Sample routing partner)"
                value={formData.nablStatus || ''}
                onChange={(e) => setFormData({ ...formData, nablStatus: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Home Collection & Service Areas */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="font-bold text-base">Service Areas & Home Collection</h2>
              <p className="text-[11px] text-slate-500">
                List localities/villages covered for home collection. If empty, the public site displays "Contact the lab to confirm your area".
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-bold block mb-1">Covered Localities / Areas (comma-separated)</label>
              <input
                type="text"
                disabled={!isOwner}
                placeholder="e.g. Bhimpura No. 1, Balauli, Bilthra Road, Rasra, Nagra"
                value={(formData.serviceAreas || []).join(', ')}
                onChange={(e) => {
                  const items = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  setFormData({ ...formData, serviceAreas: items });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Default Home Collection Charge (₹)</label>
              <input
                type="number"
                disabled={!isOwner}
                value={formData.defaultCollectionCharge}
                onChange={(e) => setFormData({ ...formData, defaultCollectionCharge: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Enter 0 for standard fee or specify actual amount</span>
            </div>
          </div>
        </div>

        {/* UPI & Financial Parameters */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-base">Financial & Payment Parameters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold block mb-1">Verified UPI Payee Name</label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.upiPayeeName}
                onChange={(e) => setFormData({ ...formData, upiPayeeName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">UPI VPA ID</label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Default Home Collection Charge (₹)</label>
              <input
                type="number"
                disabled={!isOwner}
                value={formData.defaultCollectionCharge}
                onChange={(e) => setFormData({ ...formData, defaultCollectionCharge: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">GST / Reg Placeholder (Optional)</label>
              <input
                type="text"
                disabled={!isOwner}
                placeholder="GSTIN (optional placeholder)"
                value={formData.gstNumber || ''}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Save feedback notifications */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Settings saved successfully!</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Your new UPI details, address, and timings are now active in real time on the website.
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

        {isOwner && (
          <div className="flex justify-end gap-3 items-center">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-2 transition-all min-h-[44px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Lab Settings</span>
                </>
              )}
            </button>
          </div>
        )}

      </form>

      {/* Data Export & Backup Section (Owner Only) */}
      {isOwner && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base">Data Backup & Export Tools</h2>
          </div>

          <p className="text-xs text-slate-500">
            Export comprehensive database records for offline archival, accounting reconciliation, or regulatory audits.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={maskPhonesInExport}
                onChange={(e) => setMaskPhonesInExport(e.target.checked)}
                className="rounded text-teal-600"
              />
              <span>Mask phone numbers in export files (Privacy Protection)</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">e.g. XXXXXX9057</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => exportBookingsToCSV(bookings.filter((b) => !b.isDeleted), maskPhonesInExport)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export All Bookings (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadBackup}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Full System Backup (JSON)</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
