import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Image as ImageIcon, Sliders, Palette, Type, Check, Megaphone } from 'lucide-react';

const cleanAssetUrl = (url: string): string => {
  if (!url) return '';
  return url.replace(/^\/?src\/assests\//, '/assets/').replace(/^\/?assests\//, '/assets/');
};

export function ThemeCustomizer() {
  const [accentColor, setAccentColor] = useState('#FF6B00');
  const [logoUrl, setLogoUrl] = useState('/assets/logo/logo_header.png');
  const [logoJethva, setLogoJethva] = useState('/assets/logo/logo_jethva.png');
  const [favicon, setFavicon] = useState('/favicon_jethva.png');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementTextEn, setAnnouncementTextEn] = useState('');
  const [announcementTextGu, setAnnouncementTextGu] = useState('');
  const [announcementTextHi, setAnnouncementTextHi] = useState('');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) throw error;
      const parsed: Record<string, string> = {};
      data?.forEach((item: any) => {
        parsed[item.key] = item.value;
      });

      if (parsed['theme_color']) setAccentColor(parsed['theme_color']);
      if (parsed['logo_header']) setLogoUrl(cleanAssetUrl(parsed['logo_header']));
      if (parsed['logo_jethva']) setLogoJethva(cleanAssetUrl(parsed['logo_jethva']));
      if (parsed['favicon']) setFavicon(parsed['favicon']);
      if (parsed['font_family']) setFontFamily(parsed['font_family']);
      if (parsed['announcement_enabled']) setAnnouncementEnabled(parsed['announcement_enabled'] === 'true');
      if (parsed['announcement_text_en']) setAnnouncementTextEn(parsed['announcement_text_en']);
      if (parsed['announcement_text_gu']) setAnnouncementTextGu(parsed['announcement_text_gu']);
      if (parsed['announcement_text_hi']) setAnnouncementTextHi(parsed['announcement_text_hi']);
      if (parsed['announcement_link']) setAnnouncementLink(parsed['announcement_link']);
    } catch (err) {
      console.error('Error loading site settings:', err);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { key: 'theme_color', value: accentColor },
        { key: 'logo_header', value: logoUrl },
        { key: 'logo_jethva', value: logoJethva },
        { key: 'favicon', value: favicon },
        { key: 'font_family', value: fontFamily },
        { key: 'announcement_enabled', value: String(announcementEnabled) },
        { key: 'announcement_text_en', value: announcementTextEn },
        { key: 'announcement_text_gu', value: announcementTextGu },
        { key: 'announcement_text_hi', value: announcementTextHi },
        { key: 'announcement_link', value: announcementLink },
      ];

      for (const item of updates) {
        // Find if setting exists
        const { data } = await supabase.from('site_settings').select('id').eq('key', item.key);
        if (data && data.length > 0) {
          await supabase.from('site_settings').update({ value: item.value }, data[0].id);
        } else {
          await supabase.from('site_settings').insert(item);
        }
      }

      setMessage({ type: 'success', text: 'Theme settings saved successfully! Live preview updated.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const colors = [
    { name: 'Saffron (Default)', hex: '#FF6B00' },
    { name: 'Gold', hex: '#D4AF37' },
    { name: 'Maroon', hex: '#800000' },
    { name: 'Red', hex: '#DC2626' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Indigo', hex: '#4F46E5' },
    { name: 'Slate', hex: '#475569' }
  ];

  const fonts = ['Inter', 'Playfair Display', 'Outfit', 'Roboto', 'Noto Sans Gujarati'];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Theme & Brand Customizer</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure visual system token styles, logo uploads, and previews.</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white rounded-lg transition-colors font-medium shadow"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Theme Tokens'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Options Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Accent Color Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary-500" />
              Theme Colors
            </h3>
            
            <div className="space-y-4">
              <span className="block text-xs font-semibold text-gray-500 uppercase">Select Primary Accent</span>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setAccentColor(c.hex)}
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-all"
                    style={{ borderColor: accentColor === c.hex ? accentColor : undefined }}
                  >
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.hex }} />
                    <span className="text-gray-700 dark:text-gray-300 text-xs">{c.name}</span>
                    {accentColor === c.hex && <Check className="w-3.5 h-3.5 text-primary-500" />}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Custom Color Hex</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 p-0.5 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder="#FF6B00"
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm w-36 uppercase font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo Brand Uploads */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary-500" />
              Brand Assets (Logos & Icons)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Header Light Logo URL</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm font-mono text-gray-600 dark:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Footer / Jethva Family Logo URL</label>
                <input
                  type="text"
                  value={logoJethva}
                  onChange={(e) => setLogoJethva(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm font-mono text-gray-600 dark:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Favicon URL</label>
                <input
                  type="text"
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm font-mono text-gray-600 dark:text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Announcement Bar Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary-500" />
              Announcement Bar Settings
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block">Enable Announcement Bar</label>
                  <span className="text-xs text-gray-400">Display notice banner at the very top of the website</span>
                </div>
                <input
                  type="checkbox"
                  checked={announcementEnabled}
                  onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                  className="w-5 h-5 accent-primary-500 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Announcement Text (English)</label>
                <input
                  type="text"
                  value={announcementTextEn}
                  onChange={(e) => setAnnouncementTextEn(e.target.value)}
                  placeholder="e.g. Special Darshan Timings this Sunday!"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Announcement Text (Gujarati)</label>
                <input
                  type="text"
                  value={announcementTextGu}
                  onChange={(e) => setAnnouncementTextGu(e.target.value)}
                  placeholder="દા.ત. આ રવિવારે વિશેષ દર્શન સમય!"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Announcement Text (Hindi)</label>
                <input
                  type="text"
                  value={announcementTextHi}
                  onChange={(e) => setAnnouncementTextHi(e.target.value)}
                  placeholder="उदा. इस रविवार को विशेष दर्शन का समय!"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Announcement Action Link / URL</label>
                <input
                  type="text"
                  value={announcementLink}
                  onChange={(e) => setAnnouncementLink(e.target.value)}
                  placeholder="e.g. /events or https://..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm font-mono text-gray-600 dark:text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Typography Selector */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-primary-500" />
              Typography & Fonts
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Primary Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm"
              >
                {fonts.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-2">
                This selects the main body and heading typography loaded from Google Fonts.
              </p>
            </div>
          </div>

        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary-500" />
              Live Preview
            </h3>

            {/* Render Mock elements */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-4 border border-gray-100 dark:border-gray-800" style={{ fontFamily }}>
              
              {/* Logo Preview */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200/50 flex items-center gap-3">
                <img src={logoJethva} alt="Logo" className="w-10 h-10 object-contain" onError={(e) => { e.currentTarget.src = "/assets/logo/logo_header.png" }} />
                <div>
                  <span className="text-xs font-bold text-gray-800 dark:text-white block">KHBHADIYA DHAAM</span>
                  <span className="text-[10px] text-gray-400 block">Jethva Family Mandir</span>
                </div>
              </div>

              {/* Header Navigation preview */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200/50 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-white">Menu Navigation</span>
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium text-white" style={{ backgroundColor: accentColor }}>Home</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium text-gray-500 hover:bg-gray-100">About</span>
                </div>
              </div>

              {/* Accent elements preview */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200/50 space-y-3">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: accentColor }}>Aarti Timings</span>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white">Rajbhog Aarti Schedule</h4>
                </div>
                
                <p className="text-xs text-gray-500">
                  This card dynamically changes text colors and button overlays based on accent selections.
                </p>

                <button
                  className="w-full text-xs font-semibold py-2 px-3 text-white rounded-lg transition-transform hover:scale-102 shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  Donate Now
                </button>
              </div>

            </div>

            <div className="text-center text-xs text-gray-400 mt-4">
              Real-time rendering using active HSL tokens
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
