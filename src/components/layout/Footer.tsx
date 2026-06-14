import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Heart,
  ArrowUp,
  Send,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

export function Footer() {
  const { t, language } = useLanguage();
  const [logoJethva, setLogoJethva] = useState('/src/assests/logo/logo_jethva.png');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('info@khambhadiyadhaam.com');
  const [address, setAddress] = useState('123 Temple Street, Ahmedabad, Gujarat 380001');
  const [timings, setTimings] = useState<any[]>([]);
  const [quickLinks, setQuickLinks] = useState<any[]>([]);

  useEffect(() => {
    loadFooterData();
  }, [language]);

  const loadFooterData = async () => {
    try {
      const [menuRes, settingsRes, timingsRes] = await Promise.all([
        supabase.from('menus').select('*').eq('menu_key', 'footer'),
        supabase.from('site_settings').select('*'),
        supabase.from('aarti_timings').select('*').eq('is_active', true).order('sort_order')
      ]);

      if (menuRes.data && menuRes.data.length > 0) {
        const items = menuRes.data[0].items || [];
        setQuickLinks(items.map((item: any) => ({
          path: item.path,
          label: language === 'gu' ? item.label_gu : language === 'hi' ? item.label_hi : item.label_en
        })));
      } else {
        setQuickLinks([
          { path: '/about', label: t('about') },
          { path: '/events', label: t('events') },
          { path: '/gallery', label: t('gallery') },
          { path: '/services', label: t('services') },
          { path: '/donate', label: t('donate') },
        ]);
      }

      if (settingsRes.data) {
        settingsRes.data.forEach((item: any) => {
          if (item.key === 'logo_jethva') setLogoJethva(item.value);
          if (item.key === 'phone') setPhone(item.value);
          if (item.key === 'email') setEmail(item.value);
          if (item.key === 'address') setAddress(item.value);
        });
      }

      if (timingsRes.data && timingsRes.data.length > 0) {
        setTimings(timingsRes.data.map((item: any) => ({
          name: language === 'gu' ? item.name_gu : language === 'hi' ? item.name_hi : item.name_en,
          time: item.time
        })));
      } else {
        setTimings([
          { name: language === 'gu' ? 'મંગળા આરતી' : language === 'hi' ? 'मंगला आरती' : 'Mangala', time: '5:00 AM' },
          { name: language === 'gu' ? 'શૃંગાર આરતી' : language === 'hi' ? 'श्रृंगार आरती' : 'Shringar', time: '7:30 AM' },
          { name: language === 'gu' ? 'રાજભોગ આરતી' : language === 'hi' ? 'राजभोग आरती' : 'Rajbhog', time: '12:00 PM' },
          { name: language === 'gu' ? 'સંધ્યા આરતી' : language === 'hi' ? 'संध्या आरती' : 'Sandhya', time: '7:00 PM' },
          { name: language === 'gu' ? 'શયન આરતી' : language === 'hi' ? 'शयन आरती' : 'Shayan', time: '9:00 PM' },
        ]);
      }
    } catch (err) {
      console.error('Error loading footer:', err);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const services = [
    { path: '/services?category=puja', label: language === 'gu' ? 'પૂજા બુકિંગ' : language === 'hi' ? 'पूजा बुकिंग' : 'Puja Booking' },
    { path: '/services?category=yagna', label: language === 'gu' ? 'યજ્ઞ' : language === 'hi' ? 'यज्ञ' : 'Yagna' },
    { path: '/services?category=abhishek', label: language === 'gu' ? 'અભિષેક' : language === 'hi' ? 'अभिषेक' : 'Abhishek' },
    { path: '/services?category=hall', label: language === 'gu' ? 'હોલ બુકિંગ' : language === 'hi' ? 'हॉल बुकिंग' : 'Hall Booking' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-pink-600' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:bg-red-600' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-blue-500' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-temple py-10 sm:py-12 md:py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                {language === 'gu' ? 'મંદિરના અપડેટ મેળવો' : language === 'hi' ? 'मंदिर के अपडेट प्राप्त करें' : 'Get Temple Updates'}
              </h3>
              <p className="text-white/80 text-sm sm:text-base">
                {language === 'gu' ? 'કાર્યક્રમો અને તહેવારો વિશે જાણકારી મેળવો' : language === 'hi' ? 'कार्यक्रमों और त्योहारों के बारे में जानकारी प्राप्त करें' : 'Stay informed about events and festivals'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="email"
                  placeholder={language === 'gu' ? 'તમારો ઇમેઇલ' : language === 'hi' ? 'आपका ईमेल' : 'Your email address'}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-white/20 placeholder-white/60 border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all text-white"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl group">
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span className="whitespace-nowrap">{t('submit')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
          {/* About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4 mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <img 
                  src={logoJethva} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">{t('hero_title')}</h3>
                <p className="text-sm text-gray-400">{t('hero_tagline')}</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 sm:mb-6 text-sm leading-relaxed">
              {language === 'gu' ? 'હજારો વર્ષોથી શ્રદ્ધાળુઓનું શ્રદ્ધાનું કેન્દ્ર. અહીં શાંતિ અને આશીર્વાદ મળે છે.' : language === 'hi' ? 'हजारों वर्षों से श्रद्धालुओं का श्रद्धा का केंद्र। यहां शांति और आशीर्वाद मिलता है।' : 'A center of devotion for thousands of years. Find peace and blessings here.'}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`w-10 h-10 rounded-full bg-gray-800 ${social.color} flex items-center justify-center transition-all hover:scale-110`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 sm:mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-500 rounded-full" />
              {t('quick_links')}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4 sm:mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-500 rounded-full" />
              {t('services')}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {services.map((service) => (
                <li key={service.path}>
                  <Link
                    to={service.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary-500 transition-colors" />
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-800">
              <Link
                to="/volunteer"
                className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium text-sm group"
              >
                <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {t('become_volunteer')}
              </Link>
            </div>
          </div>

          {/* Contact & Timings */}
          <div>
            <h4 className="font-semibold text-lg mb-4 sm:mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-500 rounded-full" />
              {t('contact_us')}
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  {address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <a href={`tel:${phone}`} className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <a href={`mailto:${email}`} className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                  {email}
                </a>
              </li>
            </ul>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-800">
              <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-400" />
                {t('opening_hours')}
              </h5>
              <div className="space-y-2 text-sm">
                {timings.slice(0, 3).map((timing, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-400">{timing.name}</span>
                    <span className="text-primary-400 font-medium">{timing.time}</span>
                  </div>
                ))}
                <details className="group">
                  <summary className="text-primary-400 cursor-pointer text-xs hover:text-primary-300">
                    {language === 'gu' ? 'વધુ જુઓ...' : language === 'hi' ? 'और देखें...' : 'View more...'}
                  </summary>
                  <div className="mt-2 space-y-2">
                    {timings.slice(3).map((timing, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-400">{timing.name}</span>
                        <span className="text-primary-400 font-medium">{timing.time}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs sm:text-sm text-center md:text-left">
              © {new Date().getFullYear()} {t('hero_title')}. {t('all_rights_reserved')}
            </p>
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link to="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">
                {t('privacy_policy')}
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-300 transition-colors">
                {t('terms_conditions')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-temple rounded-full flex items-center justify-center shadow-temple-lg hover:shadow-temple hover:scale-110 transition-all z-40 safe-area-inset-bottom"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 text-white" />
      </button>

      {/* Floating Donate Button for Mobile */}
      <div className="lg:hidden fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-40 safe-area-inset-bottom">
        <Link
          to="/donate"
          className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-temple rounded-full text-white font-semibold shadow-temple-lg hover:shadow-temple-lg transition-all group"
        >
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
          <span className="text-sm sm:text-base">{t('donate')}</span>
        </Link>
      </div>
    </footer>
  );
}
