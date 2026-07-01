'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { VoiceType, ChantSpeed } from '@/lib/numerals';

type NumberSystem = 'western' | 'arabic';
type Language = 'ar' | 'en';

type SettingsContextType = {
  numberSystem: NumberSystem;
  language: Language;
  voiceType: VoiceType;
  chantSpeed: ChantSpeed;
  chantRepeat: boolean;
  setNumberSystem: (s: NumberSystem) => void;
  setLanguage: (l: Language) => void;
  setVoiceType: (v: VoiceType) => void;
  setChantSpeed: (s: ChantSpeed) => void;
  setChantRepeat: (r: boolean) => void;
  toggleNumberSystem: () => void;
  toggleLanguage: () => void;
};

const SettingsContext = createContext<SettingsContextType>({
  numberSystem: 'western',
  language: 'ar',
  voiceType: 'boy',
  chantSpeed: 'normal',
  chantRepeat: false,
  setNumberSystem: () => {},
  setLanguage: () => {},
  setVoiceType: () => {},
  setChantSpeed: () => {},
  setChantRepeat: () => {},
  toggleNumberSystem: () => {},
  toggleLanguage: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [numberSystem, setNumberSystem] = useState<NumberSystem>('western');
  const [language, setLanguage] = useState<Language>('ar');
  const [voiceType, setVoiceType] = useState<VoiceType>('boy');
  const [chantSpeed, setChantSpeed] = useState<ChantSpeed>('normal');
  const [chantRepeat, setChantRepeat] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mk_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.numberSystem) setNumberSystem(parsed.numberSystem);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.voiceType) setVoiceType(parsed.voiceType);
        if (parsed.chantSpeed) setChantSpeed(parsed.chantSpeed);
        if (parsed.chantRepeat) setChantRepeat(parsed.chantRepeat);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mk_settings', JSON.stringify({ numberSystem, language, voiceType, chantSpeed, chantRepeat }));
  }, [numberSystem, language, voiceType, chantSpeed, chantRepeat]);

  const toggleNumberSystem = () => setNumberSystem(s => s === 'western' ? 'arabic' : 'western');
  const toggleLanguage = () => setLanguage(l => l === 'ar' ? 'en' : 'ar');

  return (
    <SettingsContext.Provider value={{
      numberSystem, language, voiceType, chantSpeed, chantRepeat,
      setNumberSystem, setLanguage, setVoiceType, setChantSpeed, setChantRepeat,
      toggleNumberSystem, toggleLanguage,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
