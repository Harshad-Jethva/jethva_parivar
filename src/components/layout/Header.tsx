import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Sun,
  Moon,
  Heart,
  User,
  Search,
  Phone,
  Mail,
  Megaphone,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

import { supabase } from '../../lib/supabase';

export function Header() {
  const { t, language } = useLanguage();
  const { isDark, toggleTheme, festivalMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();

  const [navLinks, setNavLinks] = useState<any[]>([]);
  const [logoUrl, setLogoUrl] = useState('/src/assests/logo/logo_header.png');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('info@khambhadiyadhaam.com');
  const [themeColor, setThemeColor] = useState('#FF6B00');
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(() => {
    return sessionStorage.getItem('announcement_dismissed') === 'true';
  });

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const updateHeight = () => {
      const rect = headerEl.getBoundingClientRect();
      document.documentElement.style.setProperty('--header-height', `${rect.height}px`);
    };

    updateHeight();

    // Call updateHeight twice to ensure layout settles (like font/image loading)
    const timeoutId = setTimeout(updateHeight, 100);

    const observer = new ResizeObserver(() => {
      updateHeight();
    });
    observer.observe(headerEl);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    loadHeaderData();
  }, [language]);

  const loadHeaderData = async () => {
    try {
      const [menuRes, settingsRes] = await Promise.all([
        supabase.from('menus').select('*').eq('menu_key', 'header'),
        supabase.from('site_settings').select('*')
      ]);

      if (menuRes.data && menuRes.data.length > 0) {
        const items = menuRes.data[0].items || [];
        const formatted = items.map((item: any) => ({
          path: item.path,
          label: language === 'gu' ? item.label_gu : language === 'hi' ? item.label_hi : item.label_en
        }));
        setNavLinks(formatted);
      } else {
        setNavLinks([
          { path: '/', label: t('home') },
          { path: '/about', label: t('about') },
          { path: '/events', label: t('events') },
          { path: '/gallery', label: t('gallery') },
          { path: '/services', label: t('services') },
          { path: '/contact', label: t('contact') },
        ]);
      }

      if (settingsRes.data) {
        let textEn = '';
        let textGu = '';
        let textHi = '';
        let enabled = false;
        let link = '';
        let emergency = false;

        settingsRes.data.forEach((item: any) => {
          if (item.key === 'logo_header') setLogoUrl(item.value);
          if (item.key === 'phone') setPhone(item.value);
          if (item.key === 'email') setEmail(item.value);
          if (item.key === 'theme_color') setThemeColor(item.value);
          
          if (item.key === 'announcement_enabled') enabled = item.value === 'true';
          if (item.key === 'announcement_text_en') textEn = item.value || '';
          if (item.key === 'announcement_text_gu') textGu = item.value || '';
          if (item.key === 'announcement_text_hi') textHi = item.value || '';
          if (item.key === 'announcement_link') link = item.value || '';
          if (item.key === 'emergency_announcement') emergency = item.value === 'true';
        });

        setAnnouncementEnabled(enabled);
        setIsEmergency(emergency);
        setAnnouncementLink(link);

        const text = language === 'gu' ? textGu : language === 'hi' ? textHi : textEn;
        setAnnouncementText(text || textEn);
      }
    } catch (err) {
      console.error('Error loading header settings:', err);
    }
  };

  const showAnnouncement = announcementEnabled && !isAnnouncementDismissed && announcementText;
  const isVisible = (showAnnouncement || isEmergency) && announcementText && !isScrolled;

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-temple'
          : 'bg-transparent'
      } ${festivalMode ? 'festival-mode' : ''}`}
    >
      <style>
        {`
          :root {
            --color-primary-500: ${themeColor};
            --color-primary-600: ${themeColor};
          }
          .bg-primary-500, .bg-primary-600, .bg-gradient-temple {
            background: ${themeColor} !important;
          }
          .text-primary-600, .text-primary-500, .text-primary-400 {
            color: ${themeColor} !important;
          }
          .border-primary-500 {
            border-color: ${themeColor} !important;
          }
          .hover\\:bg-primary-600:hover {
            background-color: ${themeColor} !important;
            opacity: 0.9;
          }
        `}
      </style>
      
      {/* Announcement Bar */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isVisible ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`w-full py-2 px-4 flex items-center justify-between relative text-xs sm:text-sm font-semibold tracking-wide text-white ${
            isEmergency
              ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-600 animate-pulse-glow shadow-inner'
              : 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 shadow-inner'
          }`}
        >
          <div className="flex-1 flex items-center justify-center gap-2 text-center px-8">
            {isEmergency ? (
              <AlertTriangle className="w-4 h-4 animate-bounce-subtle" />
            ) : (
              <Megaphone className="w-4 h-4" />
            )}
            <span>
              {announcementText}
              {announcementLink && (
                <Link
                  to={announcementLink}
                  className="ml-2 underline hover:text-white/80 transition-colors inline-flex items-center gap-0.5 font-bold"
                >
                  {language === 'gu' ? 'વધુ જાણો →' : language === 'hi' ? 'अधिक जानें →' : 'Learn More →'}
                </Link>
              )}
            </span>
          </div>
          {!isEmergency && (
            <button
              onClick={() => {
                sessionStorage.setItem('announcement_dismissed', 'true');
                setIsAnnouncementDismissed(true);
              }}
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-white absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Top Bar - Hidden on mobile */}
      <div
        className={`hidden lg:block border-b transition-all duration-300 ${isScrolled
            ? 'bg-gradient-temple text-white border-transparent'
            : 'bg-temple-bg dark:bg-gray-800 border-temple-border/20 dark:border-gray-700'
          }`}
      >
        <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a
              href={`tel:${phone}`}
              className={`flex items-center gap-2 transition-colors ${isScrolled ? 'text-white/90 hover:text-white' : 'text-temple-muted hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400'
                }`}
            >
              <Phone className="w-4 h-4" />
              <span className="hidden xl:inline">{phone}</span>
            </a>
            <a
              href={`mailto:${email}`}
              className={`flex items-center gap-2 transition-colors ${isScrolled ? 'text-white/90 hover:text-white' : 'text-temple-muted hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400'
                }`}
            >
              <Mail className="w-4 h-4" />
              <span className="hidden xl:inline">{email}</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isScrolled ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-temple-muted hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400'
                }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className={`text-sm ${isScrolled ? 'text-white/90' : 'text-temple-muted dark:text-gray-400'}`}>
              <span className="hidden xl:inline">
                {language === 'gu' ? 'સમય: સવારે 5:00 - રાત્રે 9:30' : language === 'hi' ? 'समय: सुबह 5:00 - रात 9:30' : 'Timings: 5:00 AM - 9:30 PM'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`container mx-auto px-4 transition-all duration-300 ${isScrolled ? 'py-2 sm:py-2.5' : 'py-3 sm:py-4'}`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              <div className={`transition-all duration-300 ${isScrolled ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-16 h-16 sm:w-20 sm:h-20'} flex items-center justify-center`}>
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {festivalMode && (
                <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-festival-500 rounded-full animate-pulse" />
              )}
            </div>
            <div className="hidden sm:block">
              <img
                src="/src/assests/logo/name_and_tagline.png"
                alt="KHAMBHADIYA DHAM"
                className={`transition-all duration-300 ${isScrolled ? 'h-14 sm:h-16' : 'h-20 sm:h-24'} object-contain dark:brightness-110`}
              />
              <h1 className="sr-only">KHAMBHADIYA DHAM</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, index) => {
              const isDarshan = link.path === '/darshan' || link.path === '/broadcast';
              if (isDarshan) {
                return (
                  <div
                    key={link.path}
                    className="relative group py-2"
                  >
                    <button
                      className={`px-3 xl:px-4 py-2 rounded-lg text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
                        location.pathname === '/darshan' || location.pathname === '/broadcast'
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50/80 dark:bg-primary-900/30'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10'
                      }`}
                    >
                      <span className="relative z-10">{link.label}</span>
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <svg
                        className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Hover Dropdown Menu */}
                    <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 origin-top-left z-50 p-2 space-y-1">
                      <Link
                        to="/broadcast?platform=youtube"
                        className="flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-650 dark:hover:text-red-400 transition-colors"
                      >
                        <span className="w-6 h-6 bg-red-100 dark:bg-red-950/30 rounded flex items-center justify-center text-red-600 text-sm">🎥</span>
                        <div className="text-left">
                          <span className="block text-xs font-bold">YouTube Broadcast</span>
                          <span className="text-[9px] text-gray-400 font-normal block">Watch live video stream</span>
                        </div>
                      </Link>
                      <Link
                        to="/broadcast?platform=facebook"
                        className="flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-650 dark:hover:text-blue-400 transition-colors"
                      >
                        <span className="w-6 h-6 bg-blue-100 dark:bg-blue-950/30 rounded flex items-center justify-center text-blue-600 text-sm">👥</span>
                        <div className="text-left">
                          <span className="block text-xs font-bold">Facebook Stream</span>
                          <span className="text-[9px] text-gray-400 font-normal block">Connect via Facebook Live</span>
                        </div>
                      </Link>
                      <Link
                        to="/broadcast?platform=instagram"
                        className="flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-950/20 hover:text-pink-650 dark:hover:text-pink-400 transition-colors"
                      >
                        <span className="w-6 h-6 bg-pink-100 dark:bg-pink-950/30 rounded flex items-center justify-center text-pink-600 text-sm">📸</span>
                        <div className="text-left">
                          <span className="block text-xs font-bold">Instagram Live</span>
                          <span className="text-[9px] text-gray-400 font-normal block">Follow our Instagram feed</span>
                        </div>
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                      <Link
                        to="/broadcast"
                        className="flex items-center justify-between p-2 rounded-lg text-[10px] font-bold text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-colors text-left"
                      >
                        <span>Go to Broadcast Page</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 xl:px-4 py-2 rounded-lg text-sm font-semibold transition-all relative group ${
                    location.pathname === link.path
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50/80 dark:bg-primary-900/30'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="relative z-10">{link.label}</span>
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-primary-500 rounded-full transition-all duration-300 ${
                    location.pathname === link.path ? 'w-4' : 'w-0 group-hover:w-4'
                  }`} />
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg transition-colors ${isScrolled ? 'text-temple-text dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700' : 'text-temple-text dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700'
                }`}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              to="/donate"
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-temple text-white rounded-full font-semibold shadow-temple hover:shadow-temple-lg transition-all hover:scale-105 text-sm sm:text-base group"
            >
              <Heart className="w-4 h-4 group-hover:animate-pulse" />
              <span className="hidden xl:inline">{t('donate')}</span>
              <span className="xl:hidden">{t('donate')}</span>
            </Link>

            <Link
              to="/admin"
              className={`p-2 rounded-lg transition-colors ${isScrolled ? 'text-temple-text dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700' : 'text-temple-text dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700'
                }`}
              aria-label="Admin"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/donate"
              className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-gradient-temple text-white rounded-full font-semibold shadow-temple text-sm"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">{t('donate')}</span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${isScrolled ? 'text-primary-600 dark:text-primary-400' : 'text-temple-text dark:text-white'
                }`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-[80vh] opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-temple-lg overflow-hidden">
            {/* Mobile Search */}
            <div className="p-4 border-b border-temple-border dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-temple-muted dark:text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'gu' ? 'શોધો...' : language === 'hi' ? 'खोजें...' : 'Search...'}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white border border-temple-border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="p-2 space-y-1">
              {navLinks.map((link, index) => {
                const isDarshan = link.path === '/darshan' || link.path === '/broadcast';
                if (isDarshan) {
                  return (
                    <div key={link.path} className="space-y-1">
                      <div className="flex items-center justify-between px-4 py-3 text-base font-medium text-temple-text dark:text-gray-300">
                        <span>{link.label}</span>
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      </div>
                      <div className="pl-6 space-y-1 border-l border-gray-100 dark:border-gray-700 ml-4 text-left">
                        <Link
                          to="/broadcast?platform=youtube"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-650 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <span>🎥</span> YouTube Live
                        </Link>
                        <Link
                          to="/broadcast?platform=facebook"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-650 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <span>👥</span> Facebook Live
                        </Link>
                        <Link
                          to="/broadcast?platform=instagram"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-650 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <span>📸</span> Instagram Live
                        </Link>
                        <Link
                          to="/broadcast"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary-500 font-bold hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <span>📺</span> Full Broadcast Page
                        </Link>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${location.pathname === link.path
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                        : 'text-temple-text dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700'
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Settings */}
            <div className="p-4 border-t border-temple-border dark:border-gray-700">
              <div className="flex items-center justify-between">
                <LanguageSwitcher />
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-temple-text dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="text-sm">
                    {isDark
                      ? language === 'gu' ? 'પ્રકાશ' : language === 'hi' ? 'उजाला' : 'Light'
                      : language === 'gu' ? 'ઘાટો' : language === 'hi' ? 'अंधेरा' : 'Dark'}
                  </span>
                </button>
              </div>

              {/* Mobile Contact Info */}
              <div className="mt-4 pt-4 border-t border-temple-border dark:border-gray-700 space-y-2 text-sm text-temple-muted dark:text-gray-400">
                <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-primary-500 transition-colors">
                  <Phone className="w-4 h-4" />
                  {phone}
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-primary-500 transition-colors">
                  <Mail className="w-4 h-4" />
                  {email}
                </a>
              </div>

              {/* Mobile Admin Link */}
              <Link
                to="/admin"
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <User className="w-5 h-5" />
                {t('admin')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Search Dropdown */}
      <div
        className={`hidden lg:block overflow-hidden transition-all duration-300 ${
          showSearch ? 'max-h-20 border-t border-gray-100 dark:border-gray-800' : 'max-h-0'
        }`}
      >
        <div className="container mx-auto px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'gu' ? 'મંદિરમાં કંઈક શોધો...' : language === 'hi' ? 'मंदिर में कुछ खोजें...' : 'Search for events, services, pages...'}
              className="w-full pl-12 pr-10 py-2.5 bg-gray-50 dark:bg-gray-850 text-gray-800 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-inner text-sm font-medium"
            />
            <button
              onClick={() => setShowSearch(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
