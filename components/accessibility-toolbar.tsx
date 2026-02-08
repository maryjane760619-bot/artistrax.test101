'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Eye,
  EyeOff,
  Type,
  Contrast,
  Volume2,
  Square,
  Maximize2,
  X,
  Settings,
  Languages,
} from 'lucide-react';
import { t, type Language, setLanguage, getLanguage } from '@/lib/translations';

type AccessibilitySettings = {
  highContrast: boolean;
  largeText: boolean;
  readAloud: boolean;
  reducedMotion: boolean;
  focusHighlight: boolean;
};

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguageState] = useState<Language>('en');
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    readAloud: false,
    reducedMotion: false,
    focusHighlight: true,
  });

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load accessibility settings:', e);
      }
    }
    
    // Load language preference
    setLanguageState(getLanguage());
  }, []);

  // Apply settings to DOM
  useEffect(() => {
    const root = document.documentElement;

    // High Contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large Text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced Motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Focus Highlight
    if (settings.focusHighlight) {
      root.classList.add('focus-highlight');
    } else {
      root.classList.remove('focus-highlight');
    }

    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Text-to-Speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop speech
  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Read page content
  const readPageContent = () => {
    const mainContent = document.querySelector('main');
    const headings = document.querySelectorAll('h1, h2, h3');
    const paragraphs = document.querySelectorAll('p');

    let textToRead = '';

    // Read page title
    const title = document.querySelector('h1');
    if (title) {
      textToRead += title.textContent + '. ';
    }

    // Read first few paragraphs
    Array.from(paragraphs)
      .slice(0, 3)
      .forEach((p) => {
        textToRead += p.textContent + ' ';
      });

    speakText(textToRead);
  };

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key] };
      
      // Announce change
      const settingName = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      const state = newSettings[key] ? 'enabled' : 'disabled';
      speakText(`${settingName} ${state}`);
      
      return newSettings;
    });
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguageState(newLang);
    setLanguage(newLang);
    const langName = newLang === 'es' ? 'Español' : 'English';
    speakText(`${t('language', newLang)} ${langName}`);
    
    // Trigger page reload to update all text
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          speakText('Accessibility tools opened');
        }}
        className="fixed top-20 left-4 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        aria-label="Open accessibility tools"
        title="Accessibility Tools"
      >
        <Eye className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed top-20 left-4 bg-white border-2 border-blue-600 rounded-lg shadow-2xl p-4 w-80 z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">{t('accessibilityTools', language)}</h3>
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            speakText(t('accessibilityTools', language) + ' closed');
          }}
          className="hover:bg-gray-100 p-1 rounded transition-colors"
          aria-label="Close accessibility tools"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Language Selector */}
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Languages className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-sm">{t('language', language)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`p-3 rounded-lg border-2 transition-all ${
              language === 'en'
                ? 'bg-blue-50 border-blue-600 font-semibold'
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            🇺🇸 {t('english', language)}
          </button>
          <button
            onClick={() => handleLanguageChange('es')}
            className={`p-3 rounded-lg border-2 transition-all ${
              language === 'es'
                ? 'bg-blue-50 border-blue-600 font-semibold'
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            🇪🇸 {t('spanish', language)}
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        {/* High Contrast */}
        <button
          onClick={() => toggleSetting('highContrast')}
          className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
            settings.highContrast
              ? 'bg-blue-50 border-blue-600'
              : 'bg-white border-gray-200 hover:border-blue-300'
          }`}
          aria-pressed={settings.highContrast}
        >
          <div className="flex items-center gap-3">
            <Contrast className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">{t('highContrast', language)}</div>
              <div className="text-xs text-gray-600">{t('betterVisibility', language)}</div>
            </div>
          </div>
          {settings.highContrast && (
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </button>

        {/* Large Text */}
        <button
          onClick={() => toggleSetting('largeText')}
          className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
            settings.largeText
              ? 'bg-blue-50 border-blue-600'
              : 'bg-white border-gray-200 hover:border-blue-300'
          }`}
          aria-pressed={settings.largeText}
        >
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">{t('largeText', language)}</div>
              <div className="text-xs text-gray-600">{t('easierToRead', language)}</div>
            </div>
          </div>
          {settings.largeText && (
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </button>

        {/* Reduced Motion */}
        <button
          onClick={() => toggleSetting('reducedMotion')}
          className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
            settings.reducedMotion
              ? 'bg-blue-50 border-blue-600'
              : 'bg-white border-gray-200 hover:border-blue-300'
          }`}
          aria-pressed={settings.reducedMotion}
        >
          <div className="flex items-center gap-3">
            <Square className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">{t('reducedMotion', language)}</div>
              <div className="text-xs text-gray-600">{t('lessAnimation', language)}</div>
            </div>
          </div>
          {settings.reducedMotion && (
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </button>

        {/* Focus Highlight */}
        <button
          onClick={() => toggleSetting('focusHighlight')}
          className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
            settings.focusHighlight
              ? 'bg-blue-50 border-blue-600'
              : 'bg-white border-gray-200 hover:border-blue-300'
          }`}
          aria-pressed={settings.focusHighlight}
        >
          <div className="flex items-center gap-3">
            <Maximize2 className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">{t('focusHighlight', language)}</div>
              <div className="text-xs text-gray-600">{t('showKeyboardFocus', language)}</div>
            </div>
          </div>
          {settings.focusHighlight && (
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </button>
      </div>

      {/* Text-to-Speech Controls */}
      <div className="mt-4 pt-4 border-t">
        <div className="text-sm font-medium mb-2">{t('textToSpeech', language)}</div>
        <div className="flex gap-2">
          <Button
            onClick={readPageContent}
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            {t('readPage', language)}
          </Button>
          <Button
            onClick={stopSpeech}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            {t('stop', language)}
          </Button>
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-gray-500">
        {t('settingsSavedAuto', language)}
      </div>
    </div>
  );
}
