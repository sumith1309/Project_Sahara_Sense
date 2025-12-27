"use client";

interface LanguageToggleProps {
  language: 'en' | 'ar';
  onToggle: () => void;
}

export default function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
      title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
    >
      <span className="text-lg">{language === 'en' ? '🇦🇪' : '🇬🇧'}</span>
      <span className="text-sm text-gray-300">{language === 'en' ? 'عربي' : 'EN'}</span>
    </button>
  );
}
