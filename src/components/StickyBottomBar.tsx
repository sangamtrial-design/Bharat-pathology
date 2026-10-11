import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLabSettings } from '../context/LabSettingsContext';

export const StickyBottomBar: React.FC = () => {
  const { t } = useLanguage();
  const { telLink, whatsappUrl } = useLabSettings();

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 shadow-lg safe-area-pb">
      <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
        
        {/* Direct Phone Call Button */}
        <a
          href={telLink}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-slate-300 bg-white active:bg-slate-100 text-slate-800 font-bold text-sm shadow-xs transition-colors min-h-[48px]"
          aria-label="Call Bharat Pathology directly"
        >
          <Phone className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{t('Call Lab', 'कॉल करें')}</span>
        </a>

        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors min-h-[48px]"
          aria-label="Chat on WhatsApp with Bharat Pathology"
        >
          <MessageCircle className="w-4 h-4 fill-white/20 shrink-0" />
          <span>WhatsApp</span>
        </a>

      </div>
    </div>
  );
};
