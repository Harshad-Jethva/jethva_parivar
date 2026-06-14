import { useLanguage } from '../../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-temple-text/5 transition-colors"
        aria-label="Select language"
      >
        <Globe className="w-5 h-5 text-primary-500" />
        <span className="text-sm font-medium text-temple-text">
          {language === 'gu' ? 'ગુજ' : language === 'hi' ? 'हिं' : 'EN'}
        </span>
      </button>
      <div className="absolute right-0 top-full mt-1 py-2 bg-white rounded-lg shadow-temple-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[120px]">
        <button
          onClick={() => setLanguage('gu')}
          className={`w-full px-4 py-2 text-left text-sm hover:bg-primary-50 transition-colors ${
            language === 'gu' ? 'text-primary-600 font-semibold bg-primary-50' : 'text-temple-text'
          }`}
        >
          ગુજરાતી
        </button>
        <button
          onClick={() => setLanguage('hi')}
          className={`w-full px-4 py-2 text-left text-sm hover:bg-primary-50 transition-colors ${
            language === 'hi' ? 'text-primary-600 font-semibold bg-primary-50' : 'text-temple-text'
          }`}
        >
          हिन्दी
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`w-full px-4 py-2 text-left text-sm hover:bg-primary-50 transition-colors ${
            language === 'en' ? 'text-primary-600 font-semibold bg-primary-50' : 'text-temple-text'
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
}
