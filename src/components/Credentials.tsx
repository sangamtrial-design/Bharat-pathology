import React from 'react';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLabSettings } from '../context/LabSettingsContext';

export const Credentials: React.FC = () => {
  const { t } = useLanguage();
  const { settings } = useLabSettings();

  const incharge = (settings.labInchargeName || '').trim();
  const qualification = (settings.qualification || '').trim();
  const regNo = (settings.registrationNumber || '').trim();
  const nabl = (settings.nablStatus || '').trim();
  const labRegNo = (settings.labRegistrationNumber || '').trim();

  // If all are empty, hide the section completely per requirement A4
  const hasAnyCredentials = Boolean(incharge || qualification || regNo || nabl || labRegNo);
  if (!hasAnyCredentials) {
    return null;
  }

  return (
    <section id="credentials" className="py-14 sm:py-18 bg-white border-b border-slate-200/60 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-teal-50/70 via-white to-slate-50 border border-teal-200/80 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
                  {t('Verified Laboratory Credentials', 'सत्यापित लैब पंजीकरण एवं योग्यता')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {t('Professional Information & Accreditations', 'व्यावसायिक विवरण एवं मान्यता')}
                </h3>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold self-start sm:self-auto border border-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{t('Verified Details', 'सत्यापित विवरण')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
            {incharge && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-500 font-medium block text-xs">
                  {t('Lab In-charge / Pathologist', 'लैब प्रभारी / पैथोलॉजिस्ट')}
                </span>
                <span className="text-slate-900 font-bold text-base mt-0.5 block">{incharge}</span>
              </div>
            )}

            {qualification && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-500 font-medium block text-xs">
                  {t('Qualification', 'शैक्षणिक एवं व्यावसायिक योग्यता')}
                </span>
                <span className="text-slate-900 font-semibold mt-0.5 block">{qualification}</span>
              </div>
            )}

            {regNo && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-500 font-medium block text-xs">
                  {t('Medical Council Reg. No.', 'मेडिकल काउंसिल पंजीकरण संख्या')}
                </span>
                <span className="text-slate-900 font-mono font-bold mt-0.5 block">{regNo}</span>
              </div>
            )}

            {labRegNo && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-500 font-medium block text-xs">
                  {t('Clinical Lab Reg. No.', 'क्लिनिकल लैब पंजीकरण संख्या')}
                </span>
                <span className="text-slate-900 font-mono font-bold mt-0.5 block">{labRegNo}</span>
              </div>
            )}

            {nabl && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-500 font-medium block text-xs">
                  {t('Accreditation Status', 'मान्यता स्थिति')}
                </span>
                <span className="text-slate-900 font-semibold mt-0.5 block">{nabl}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
