import React, { useState } from 'react';
import { Language } from '../i18n/i18n';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const languages: { code: Language; name: string }[] = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (language: Language) => {
    onLanguageChange(language);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex items-center justify-center w-full rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent"
        onClick={toggleDropdown}
      >
        {languages.find(lang => lang.code === currentLanguage)?.name}
        <svg
          className={`ml-2 -mr-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-32 origin-top-right rounded-md bg-surface shadow-lg ring-1 ring-white/10 transition-all duration-300 ease-in-out"
        >
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                className={`block px-4 py-2 text-sm w-full text-left ${currentLanguage === language.code 
                  ? 'bg-accent text-black font-medium' 
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                onClick={() => handleLanguageSelect(language.code)}
              >
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
