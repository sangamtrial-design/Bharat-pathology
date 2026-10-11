import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LabSettings, WebsiteTheme } from '../types/admin';
import { DEFAULT_SETTINGS } from '../lib/adminFirestore';
import { LAB_DETAILS } from '../data';

export interface ThemeOption {
  id: WebsiteTheme;
  name: string;
  nameHi: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  badgeBg: string;
}

export const THEME_PRESETS: ThemeOption[] = [
  {
    id: 'teal',
    name: 'Bharat Classic Teal',
    nameHi: 'क्लासिक मेडिकल टील',
    description: 'Fresh, balanced clinical healthcare emerald teal (Default).',
    primaryColor: '#0d9488',
    accentColor: '#14b8a6',
    badgeBg: 'bg-teal-500'
  },
  {
    id: 'blue',
    name: 'Clinical Trust Sapphire',
    nameHi: 'क्लीनिकल ट्रस्ट ब्लू',
    description: 'Authoritative, hospital-grade deep royal sapphire blue.',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    badgeBg: 'bg-sky-500'
  },
  {
    id: 'emerald',
    name: 'Ayur & Herbal Green',
    nameHi: 'आयुर्वेद एवं प्राकृतिक हरा',
    description: 'Vitalizing, soothing natural organic healthcare green.',
    primaryColor: '#059669',
    accentColor: '#10b981',
    badgeBg: 'bg-emerald-500'
  },
  {
    id: 'purple',
    name: 'Health Luxe Royal Violet',
    nameHi: 'मॉडर्न हेल्थ लक्स पर्पल',
    description: 'Modern, high-tech premium diagnostic violet & indigo.',
    primaryColor: '#7c3aed',
    accentColor: '#a855f7',
    badgeBg: 'bg-purple-500'
  },
  {
    id: 'rose',
    name: 'Warm Care & Cardiology Rose',
    nameHi: 'वार्म केयर एवं रोज़',
    description: 'Compassionate, warm clinical cardiology crimson rose.',
    primaryColor: '#e11d48',
    accentColor: '#f43f5e',
    badgeBg: 'bg-rose-500'
  }
];

interface LabSettingsContextType {
  settings: LabSettings;
  loading: boolean;
  phoneRaw: string;
  whatsappUrl: string;
  telLink: string;
  currentTheme: WebsiteTheme;
}

const LabSettingsContext = createContext<LabSettingsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'bp_lab_settings_cache';

export const LabSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<LabSettings>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });
  const [loading, setLoading] = useState(true);

  // Apply data-theme to HTML tag whenever settings.theme changes
  useEffect(() => {
    const activeTheme = settings.theme || 'teal';
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [settings.theme]);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'general');

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const remoteData = snap.data() as Partial<LabSettings>;
          const merged: LabSettings = {
            ...DEFAULT_SETTINGS,
            ...remoteData,
            // Ensure strings are sanitized
            upiId: (remoteData.upiId || DEFAULT_SETTINGS.upiId || '').trim(),
            upiPayeeName: (remoteData.upiPayeeName || DEFAULT_SETTINGS.upiPayeeName || '').trim(),
            theme: remoteData.theme || DEFAULT_SETTINGS.theme || 'teal'
          };
          setSettings(merged);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Could not subscribe to public lab settings from Firestore:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Compute clean phone & whatsapp links
  const rawPhoneDigits = (settings.phone || LAB_DETAILS.phoneRaw).replace(/\D/g, '');
  const rawWhatsappDigits = (settings.whatsapp || settings.phone || '918887790574').replace(/\D/g, '');
  
  // Format Indian phone number if 10 digits
  const cleanPhone = rawPhoneDigits.length === 10 ? `+91${rawPhoneDigits}` : (settings.phone || LAB_DETAILS.phoneRaw);
  const telLink = `tel:${cleanPhone.replace(/\s+/g, '')}`;
  const whatsappUrl = `https://wa.me/${rawWhatsappDigits.length === 10 ? `91${rawWhatsappDigits}` : rawWhatsappDigits}`;

  return (
    <LabSettingsContext.Provider
      value={{
        settings,
        loading,
        phoneRaw: cleanPhone,
        whatsappUrl,
        telLink,
        currentTheme: settings.theme || 'teal'
      }}
    >
      {children}
    </LabSettingsContext.Provider>
  );
};

export const useLabSettings = () => {
  const context = useContext(LabSettingsContext);
  if (!context) {
    throw new Error('useLabSettings must be used within a LabSettingsProvider');
  }
  return context;
};

