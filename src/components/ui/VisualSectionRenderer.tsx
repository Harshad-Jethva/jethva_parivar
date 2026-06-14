import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Calendar, Clock, MapPin, ArrowRight, Play, ChevronLeft, 
  ChevronRight, Star, Users, Gift, Bell, Sparkles, BookOpen, 
  Phone, Mail, Check, AlertTriangle, Eye, EyeOff, Layout as LayoutIcon,
  HelpCircle, Trash, Copy, Edit, Compass, Image as ImageIcon
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LayoutStyles {
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  gap?: string;
  alignment?: string;
  background?: string;
  borderRadius?: string;
  shadow?: string;
  animation?: string;
}

interface VisualSectionRendererProps {
  section: any;
  mode: 'live' | 'edit';
  language: 'gu' | 'hi' | 'en';
  onUpdateSection?: (sectionId: string, updatedContent: any) => void;
  onSelectElement?: (elementInfo: { type: 'section' | 'button' | 'image' | 'layout'; sectionId: string; path: string; data: any }) => void;
  selectedPath?: string;
}

export function VisualSectionRenderer({
  section,
  mode,
  language,
  onUpdateSection,
  onSelectElement,
  selectedPath
}: VisualSectionRendererProps) {
  const isEditMode = mode === 'edit';
  const content = section.content || {};
  const layout: LayoutStyles = content.layout || {};

  // Dynamic state for databases
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [aartiTimings, setAartiTimings] = useState<any[]>([]);

  useEffect(() => {
    if (section.section_key === 'events') {
      supabase.from('events').select('*').eq('is_featured', true).limit(3).then((res: any) => {
        if (res.data) setFeaturedEvents(res.data);
      });
    } else if (section.section_key === 'testimonials') {
      supabase.from('testimonials').select('*').eq('is_approved', true).limit(5).then((res: any) => {
        if (res.data) setTestimonials(res.data);
      });
    } else if (section.section_key === 'aarti') {
      supabase.from('aarti_timings').select('*').eq('is_active', true).order('sort_order').then((res: any) => {
        if (res.data && res.data.length > 0) setAartiTimings(res.data);
      });
    }
  }, [section.section_key]);


  // Visibility Check helper in Live Mode
  if (!isEditMode && !section.is_active) {
    return null;
  }

  // Helper to resolve nested content with localization support
  const getVal = (path: string, defaultValue: string = ''): string => {
    const parts = path.split('.');
    let current = content;
    for (const part of parts) {
      if (current === undefined || current === null) return defaultValue;
      current = current[part];
    }
    if (current && typeof current === 'object') {
      return current[language] || current['en'] || current['gu'] || current['hi'] || defaultValue;
    }
    return current !== undefined ? String(current) : defaultValue;
  };

  // Helper to update a nested property in the content JSON
  const handleUpdateText = (path: string, newValue: string) => {
    if (!onUpdateSection) return;
    const updatedContent = JSON.parse(JSON.stringify(content));
    const parts = path.split('.');
    let current = updatedContent;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    
    // If targeted field is localized object or simple string
    const lastKey = parts[parts.length - 1];
    if (current[lastKey] && typeof current[lastKey] === 'object' && !Array.isArray(current[lastKey])) {
      current[lastKey][language] = newValue;
    } else {
      current[lastKey] = newValue;
    }
    onUpdateSection(section.id, updatedContent);
  };

  // Inline Editable text wrapper
  const renderText = (path: string, defaultValue: string, className: string = '', elementTag: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' = 'span') => {
    const value = getVal(path, defaultValue);
    const Tag = elementTag;

    if (isEditMode) {
      const isSelected = selectedPath === `${section.id}.${path}`;
      return (
        <Tag
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleUpdateText(path, e.currentTarget.innerText)}
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectElement) {
              onSelectElement({
                type: 'layout',
                sectionId: section.id,
                path,
                data: { text: value }
              });
            }
          }}
          className={`${className} cursor-text outline-dashed outline-1 outline-offset-2 hover:outline-primary-500 transition-all ${
            isSelected ? 'outline-primary-500 outline-2 bg-primary-500/5' : 'outline-gray-400/30'
          }`}
        >
          {value}
        </Tag>
      );
    }

    // Hide if specifically configured to hide
    const visibilityPath = `${path}_visible`;
    if (content[visibilityPath] === false) return null;

    return <Tag className={className}>{value}</Tag>;
  };

  // Render Image Wrapper
  const renderImage = (path: string, defaultUrl: string, className: string = '', altText: string = 'Asset') => {
    const url = getVal(path, defaultUrl);
    const isSelected = selectedPath === `${section.id}.${path}`;

    if (isEditMode) {
      return (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectElement) {
              onSelectElement({
                type: 'image',
                sectionId: section.id,
                path,
                data: { url, alt: altText, height: content[`${path}_height`], width: content[`${path}_width`] }
              });
            }
          }}
          className={`relative group cursor-pointer overflow-hidden rounded-lg outline-dashed outline-1 outline-offset-2 hover:outline-primary-500 transition-all ${
            isSelected ? 'outline-primary-500 outline-2 bg-primary-500/5' : 'outline-gray-400/30'
          }`}
        >
          <img src={url} alt={altText} className={`${className} max-w-full`} />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-semibold flex items-center gap-1.5 bg-black/60 px-2.5 py-1.5 rounded-full">
              <ImageIcon className="w-3.5 h-3.5" />
              Configure Image
            </span>
          </div>
        </div>
      );
    }

    const visibilityPath = `${path}_visible`;
    if (content[visibilityPath] === false) return null;

    return <img src={url} alt={altText} className={className} />;
  };

  // Render Button / CTA Wrapper
  const renderButton = (path: string, defaultText: string, defaultLink: string, className: string = '') => {
    const text = getVal(`${path}.text`, defaultText);
    const link = getVal(`${path}.link`, defaultLink);
    const isHidden = content[`${path}_visible`] === false;
    const isSelected = selectedPath === `${section.id}.${path}`;

    if (isHidden && !isEditMode) return null;

    const btnStyle: React.CSSProperties = {
      opacity: isHidden ? 0.4 : 1
    };
    if (content[`${path}.color`]) {
      btnStyle.backgroundColor = content[`${path}.color`];
    }

    if (isEditMode) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectElement) {
              onSelectElement({
                type: 'button',
                sectionId: section.id,
                path,
                data: {
                  text,
                  link,
                  color: content[`${path}.color`],
                  icon: content[`${path}.icon`],
                  visible: !isHidden
                }
              });
            }
          }}
          style={btnStyle}
          className={`${className} cursor-pointer relative outline-dashed outline-1 outline-offset-2 hover:outline-primary-500 transition-all ${
            isSelected ? 'outline-primary-500 outline-2' : 'outline-gray-400/30'
          }`}
        >
          {isHidden && <EyeOff className="w-3 h-3 text-red-500 absolute -top-1 -right-1 bg-white rounded-full p-0.5" />}
          <span>{text}</span>
        </button>
      );
    }

    return (
      <Link
        to={link}
        style={btnStyle}
        className={className}
      >
        <span>{text}</span>
      </Link>
    );
  };

  // Convert layout settings to inline CSS
  const getLayoutStyles = () => {
    const styles: React.CSSProperties = {};
    if (layout.padding) styles.padding = layout.padding;
    if (layout.margin) styles.margin = layout.margin;
    if (layout.background) styles.background = layout.background;
    if (layout.borderRadius) styles.borderRadius = layout.borderRadius;
    if (layout.shadow) styles.boxShadow = layout.shadow;
    return styles;
  };

  // Switch Render templates based on Section Keys
  const renderSectionBody = () => {
    switch (section.section_key) {
      case 'hero': {
        const slides = content.slides || [
          {
            image: 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?auto=compress&cs=tinysrgb&w=1920',
            title: { en: 'Welcome to Khambhadiya Dham', gu: 'ખંભાળિયા ધામમાં આપનું સ્વાગત છે', hi: 'खंभालिया धाम में आपका स्वागत है' },
            subtitle: { en: 'A Sacred Place of Worship and Heritage', gu: 'શ્રદ્ધા, સંસ્કૃતિ અને ભક્તિનું પવિત્ર કેન્દ્ર', hi: 'श्रद्धा, संस्कृति और भक्ति का पावन केंद्र' }
          }
        ];

        return (
          <div className="relative min-h-[500px] flex items-center justify-center text-white overflow-hidden py-20 bg-gray-900">
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${slides[0].image})` }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            <div className="relative container mx-auto px-4 text-center max-w-4xl z-10">
              {renderText('hero_banner_badge', 'TIMINGS: 5:00 AM - 9:30 PM', 'inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full mb-6 text-xs sm:text-sm font-medium border border-white/20', 'span')}
              {renderText('slides.0.title', slides[0].title[language], 'font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow', 'h1')}
              {renderText('slides.0.subtitle', slides[0].subtitle[language], 'text-base sm:text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto', 'p')}
              
              <div className="flex flex-wrap items-center justify-center gap-4">
                {renderButton('button_primary', 'Book Darshan', '/darshan', 'group inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 rounded-full font-semibold shadow hover:scale-105 transition-all text-sm sm:text-base')}
                {renderButton('button_secondary', 'Donate Now', '/donate', 'group inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-full font-semibold shadow hover:scale-105 transition-all text-sm sm:text-base')}
              </div>
            </div>
          </div>
        );
      }

      case 'stats': {
        const items = content.items || [
          { value: '50K+', label: { en: 'Devotees', gu: 'શ્રદ્ધાળુઓ', hi: 'श्रद्धालु' } },
          { value: '100+', label: { en: 'Annual Events', gu: 'વાર્ષિક કાર્યક્રમો', hi: 'वार्षिक कार्यक्रम' } },
          { value: '50+', label: { en: 'Years History', gu: 'વર્ષોનો ઇતિહાસ', hi: 'वर्षों का इतिहास' } },
          { value: '10M+', label: { en: 'Donations Recieved', gu: 'દાન એકત્રિત', hi: 'दान एकत्र' } }
        ];

        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-temple-lg p-6 md:p-8 relative z-10 -mt-10 mx-4 border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-500">
                    {renderText(`items.${idx}.value`, item.value, 'block', 'span')}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {renderText(`items.${idx}.label`, item.label[language] || item.label.en, 'block', 'span')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'aarti': {
        const timings = content.timings || [
          { name: { en: 'Mangala', gu: 'મંગળા આરતી', hi: 'मंगला आरती' }, time: '5:00 AM' },
          { name: { en: 'Shringar', gu: 'શૃંગાર આરતી', hi: 'श्रृंगार आरती' }, time: '7:30 AM' },
          { name: { en: 'Rajbhog', gu: 'રાજભોગ આરતી', hi: 'राजभोग आरती' }, time: '12:00 PM' }
        ];

        return (
          <div className="py-12 bg-gray-50 dark:bg-gray-900/50">
            <div className="container mx-auto px-4 max-w-6xl text-center">
              {renderText('aarti_subtitle', 'Daily Schedule', 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 rounded-full text-xs font-semibold mb-3', 'span')}
              {renderText('aarti_title', 'Daily Aarti Timings', 'text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6', 'h2')}
              
              <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-4">
                {timings.map((t: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
                    <Clock className="w-6 h-6 text-primary-500 mb-3" />
                    <span className="font-bold text-sm text-gray-800 dark:text-white">
                      {renderText(`timings.${idx}.name`, t.name[language] || t.name.en, 'block', 'span')}
                    </span>
                    <span className="text-primary-600 dark:text-primary-400 font-extrabold text-lg mt-1">
                      {renderText(`timings.${idx}.time`, t.time, 'block', 'span')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'events': {
        const displayEvents = featuredEvents.length > 0 ? featuredEvents : [
          {
            id: '1',
            title_en: 'Ram Navami Festival',
            title_gu: 'રામ નવમી તહેવાર',
            title_hi: 'राम नवमी त्योहार',
            event_date: '2025-03-28',
            category: 'festival',
            start_time: '06:00',
            venue: 'Main Sanctuary',
            image_url: 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?auto=compress&cs=tinysrgb&w=800',
            registration_required: false
          },
          {
            id: '2',
            title_en: 'Hanuman Jayanti',
            title_gu: 'હનુમાન જયંતી',
            title_hi: 'हनुमान जयंती',
            event_date: '2025-04-12',
            category: 'festival',
            start_time: '05:00',
            venue: 'Temple Hall',
            image_url: 'https://images.pexels.com/photos/5458388/pexels-photo-5458388.jpeg?auto=compress&cs=tinysrgb&w=800',
            registration_required: true,
            current_registrations: 150,
            max_attendees: 500
          }
        ];

        return (
          <div className="py-12 bg-white dark:bg-gray-800">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center sm:text-left mb-8 flex flex-col sm:flex-row justify-between items-end">
                <div>
                  {renderText('events_badge', 'Upcoming Programs', 'text-primary-600 text-xs font-bold uppercase tracking-wider block mb-1', 'span')}
                  {renderText('events_title', 'Featured Temple Events', 'text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white', 'h2')}
                </div>
                {renderButton('events_cta', 'View All Events', '/events', 'text-sm font-semibold text-primary-500 hover:text-primary-650 flex items-center gap-1')}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayEvents.slice(0, 3).map((event: any, idx: number) => (
                  <div key={event.id} className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                    <img src={event.image_url} alt={event.title_en} className="w-full h-40 object-cover" />
                    <div className="p-4 space-y-2">
                      <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase rounded-full">
                        {event.category}
                      </span>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-white line-clamp-2">
                        {event[`title_${language}`] || event.title_en}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {event.start_time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary-500" /> {event.start_time}</span>}
                        {event.venue && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary-500" /> {event.venue}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'testimonials': {
        const displayTestimonials = testimonials.length > 0 ? testimonials : [
          { name: 'Kirit Jethva', location: 'Dwarka', content_en: 'Visiting Khambhadiya Dham brings ultimate peace and spiritual energy to our entire family.', content_gu: 'ખંભાળિયા ધામની મુલાકાત અમારા સમગ્ર પરિવારને અલ્ટીમેટ શાંતિ અને આધ્યાત્મિક ઉર્જા આપે છે.', content_hi: 'खंभालिया धाम की यात्रा हमारे पूरे परिवार को परम शांति और आध्यात्मिक ऊर्जा प्रदान करती है।' },
          { name: 'Ramanbhai Patel', location: 'Ahmedabad', content_en: 'Very well managed temple committee, cleaner facilities and wonderful darshan management.', content_gu: 'ખૂબ જ સરસ વ્યવસ્થાપન, સ્વચ્છ સુવિધાઓ અને સુંદર દર્શન વ્યવસ્થા.', content_hi: 'बहुत अच्छी तरह से प्रबंधित मंदिर समिति, स्वच्छ सुविधाएं और अद्भुत दर्शन प्रबंधन।' }
        ];

        return (
          <div className="py-12 bg-gray-50 dark:bg-gray-900/30">
            <div className="container mx-auto px-4 max-w-6xl text-center">
              {renderText('testimonials_badge', 'Devotee Experiences', 'text-primary-600 text-xs font-bold uppercase tracking-wider block mb-1', 'span')}
              {renderText('testimonials_title', 'What Devotees Say', 'text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-8', 'h2')}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayTestimonials.slice(0, 3).map((t: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-150/70 dark:border-gray-700 shadow-sm text-left flex flex-col justify-between">
                    <div>
                      <div className="flex gap-0.5 text-amber-400 mb-3">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm italic leading-relaxed mb-4">
                        "{t[`content_${language}`] || t.content_en}"
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                      <span className="font-bold text-sm text-gray-800 dark:text-white block">{t.name}</span>
                      <span className="text-xs text-gray-400 block">{t.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'history': {
        return (
          <div className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  {renderText('history_badge', 'Our Sacred Heritage', 'text-primary-600 text-xs font-bold uppercase tracking-wider', 'span')}
                  {renderText('history_title', 'Temple History & Legends', 'text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white', 'h2')}
                  {renderText('history_text', 'Khambhadiya Dham is a sacred place of worship and spiritual energy. Founded on principles of community devotion and centuries of lineage, this sanctuary hosts peaceful services and welcomes thousands of families.', 'text-gray-600 dark:text-gray-300 text-sm leading-relaxed', 'p')}
                  <div className="pt-2">
                    {renderButton('history_cta', 'Read Full Story', '/about', 'inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700')}
                  </div>
                </div>
                <div>
                  {renderImage('history_image', 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?auto=compress&cs=tinysrgb&w=800', 'rounded-2xl shadow-lg w-full object-cover h-64', 'History Image')}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'donate': {
        return (
          <div className="py-16 bg-gradient-temple text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative container mx-auto px-4 max-w-4xl text-center z-10">
              {renderText('donate_badge', 'Tax Exempt Under 80G', 'inline-block bg-white/20 border border-white/30 text-white text-xs px-3 py-1 rounded-full font-bold mb-4', 'span')}
              {renderText('donate_title', 'Support Shree Ram Mandir Devotional Services', 'text-2xl sm:text-3xl font-bold mb-4', 'h2')}
              {renderText('donate_subtitle', 'Your donations keep our spiritual functions active, providing free food prasad, supporting Vedic schools, and maintaining holy sanctuaries.', 'text-white/95 text-sm max-w-2xl mx-auto mb-6 leading-relaxed', 'p')}
              
              <div className="flex justify-center gap-4">
                {renderButton('donate_cta', 'Donate Now', '/donate', 'inline-flex items-center justify-center px-6 py-2.5 bg-white text-primary-600 rounded-full font-semibold shadow hover:scale-105 transition-all text-sm')}
              </div>
            </div>
          </div>
        );
      }

      case 'about_details': {
        return (
          <div className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 max-w-5xl space-y-12">
              <div className="text-center space-y-2">
                {renderText('about_title', 'About Khambhadiya Dham', 'text-3xl font-bold text-gray-800 dark:text-white', 'h2')}
                {renderText('about_subtitle', 'Honoring Jethva Parivar legacy and Vedic traditions', 'text-sm text-gray-500', 'p')}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-primary-500 mb-3">Our Mission</h3>
                  {renderText('mission_text', 'To safeguard and perpetuate Vedic spiritual rituals, devotional events, and community support systems across our regional centers.', 'text-sm text-gray-600 dark:text-gray-300 leading-relaxed', 'p')}
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-primary-500 mb-3">Our Vision</h3>
                  {renderText('vision_text', 'Creating a global spiritual haven centered on devotion, absolute harmony, educational wisdom, and sacred prayers.', 'text-sm text-gray-600 dark:text-gray-300 leading-relaxed', 'p')}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'contact_details': {
        return (
          <div className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  {renderText('contact_heading', 'Get In Touch', 'text-2xl font-bold text-gray-800 dark:text-white', 'h2')}
                  {renderText('contact_description', 'For inquiry, ritual bookings, or event details, please reach out to our administration office.', 'text-sm text-gray-600 dark:text-gray-400', 'p')}
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary-50 dark:bg-primary-950/20 text-primary-500 rounded-lg">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Contact Phone</span>
                        {renderText('contact_phone', '+91 98765 43210', 'text-sm font-semibold text-gray-800 dark:text-white', 'span')}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary-50 dark:bg-primary-950/20 text-primary-500 rounded-lg">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Email Address</span>
                        {renderText('contact_email', 'info@khambhadiyadhaam.com', 'text-sm font-semibold text-gray-800 dark:text-white', 'span')}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary-50 dark:bg-primary-950/20 text-primary-500 rounded-lg">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Temple Address</span>
                        {renderText('contact_address', 'Shree Ram Mandir, Khambhadiya, Gujarat, India', 'text-sm font-semibold text-gray-800 dark:text-white', 'span')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-base">Send Us a Message</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Your Name" disabled className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm" />
                    <input type="email" placeholder="Email Address" disabled className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm" />
                    <textarea rows={3} placeholder="Write your message here..." disabled className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm" />
                    <button disabled className="w-full py-2 bg-primary-500 text-white rounded-lg text-sm font-medium opacity-80">Submit (Disabled in Builder)</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'gallery': {
        const photos = content.photos || [
          { url: 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?auto=compress&cs=tinysrgb&w=800', caption: 'Temple Sanctuary' },
          { url: 'https://images.pexels.com/photos/5458388/pexels-photo-5458388.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Festival Celebration' },
          { url: 'https://images.pexels.com/photos/761425/pexels-photo-761425.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Bhajan Sandhya' }
        ];

        return (
          <div className="py-12 bg-white dark:bg-gray-800">
            <div className="container mx-auto px-4 max-w-6xl text-center">
              {renderText('gallery_badge', 'Devotional Memories', 'text-primary-600 text-xs font-bold uppercase tracking-wider block mb-1', 'span')}
              {renderText('gallery_title', 'Photo & Video Gallery', 'text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-8', 'h2')}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((p: any, idx: number) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden shadow-sm group">
                    {renderImage(`photos.${idx}.url`, p.url, 'w-full h-48 object-cover', p.caption)}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-center text-white text-xs">
                      {renderText(`photos.${idx}.caption`, p.caption, 'block', 'span')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      default: {
        return (
          <div className="py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center p-6 bg-gray-50 dark:bg-gray-800">
            <LayoutIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h4 className="font-bold text-gray-800 dark:text-white text-sm">
              {section.title_en || 'Section Details'}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Section key: <span className="font-mono text-primary-500">{section.section_key}</span>. Manage elements inside the properties panels.
            </p>
          </div>
        );
      }
    }
  };

  // Outer Wrapper supporting outlines and drag & drop elements highlights
  return (
    <div 
      id={`section-wrapper-${section.id}`}
      style={getLayoutStyles()}
      onClick={(e) => {
        if (isEditMode) {
          e.stopPropagation();
          if (onSelectElement) {
            onSelectElement({
              type: 'section',
              sectionId: section.id,
              path: '',
              data: section
            });
          }
        }
      }}
      className={`relative transition-all ${
        isEditMode 
          ? `group/section outline-none border border-transparent hover:border-primary-400/50 cursor-pointer ${
              selectedPath === `${section.id}` ? 'ring-2 ring-primary-500 ring-offset-2' : ''
            }`
          : ''
      }`}
    >
      {/* Editor Control Pill (Floating over the section in Edit Mode) */}
      {isEditMode && (
        <div className="absolute top-2 right-2 opacity-0 group-hover/section:opacity-100 transition-opacity z-20 flex gap-1.5 bg-gray-950/90 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-md">
          <span className="uppercase text-primary-400 tracking-wider font-mono">
            {section.section_key}
          </span>
          {!section.is_active && <EyeOff className="w-3 h-3 text-red-400" />}
        </div>
      )}

      {renderSectionBody()}
    </div>
  );
}
