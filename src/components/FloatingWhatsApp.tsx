import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLabSettings } from '../context/LabSettingsContext';

export const FloatingWhatsApp: React.FC = () => {
  const { t } = useLanguage();
  const { whatsappUrl } = useLabSettings();

  return (
    <aside 
      aria-label="WhatsApp quick chat"
      className="hidden sm:flex fixed bottom-6 right-6 z-50 items-center gap-2"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        aria-label="Chat with Bharat Pathology on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white/20" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold">
          {t('Chat on WhatsApp', 'व्हाट्सएप चैट')}
        </span>
        <span className="sm:inline group-hover:hidden text-xs font-bold">WhatsApp</span>
      </a>
    </aside>
  );
};
