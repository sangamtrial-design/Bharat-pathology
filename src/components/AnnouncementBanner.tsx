import React from 'react';
import { Megaphone, X } from 'lucide-react';
import { useLabSettings } from '../context/LabSettingsContext';

export const AnnouncementBanner: React.FC = () => {
  const { settings } = useLabSettings();
  const [dismissed, setDismissed] = React.useState(false);

  if (!settings.announcementActive || !settings.announcementText || dismissed) {
    return null;
  }

  return (
    <aside 
      aria-label="Important Announcement"
      className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs border-b border-amber-300 relative z-30 animate-in slide-in-from-top-2 duration-200"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Megaphone className="w-4 h-4 text-slate-950 shrink-0 animate-bounce" />
          <span className="font-bold tracking-tight">{settings.announcementText}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md hover:bg-amber-600/20 text-slate-900 transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
