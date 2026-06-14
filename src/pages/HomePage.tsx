import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { VisualSectionRenderer } from '../components/ui/VisualSectionRenderer';

export function HomePage() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const pageRes = await supabase.from('pages').select('id').eq('slug', 'home');
      if (pageRes.data && pageRes.data.length > 0) {
        const pageId = pageRes.data[0].id;
        const sectionsRes = await supabase.from('page_sections').select('*').eq('page_id', pageId).order('sort_order');
        if (sectionsRes.data && sectionsRes.data.length > 0) {
          setSections(sectionsRes.data);
        }
      }
    } catch (error) {
      console.error('Error loading page sections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const orderedSections = sections.length > 0
    ? [...sections].sort((a, b) => a.sort_order - b.sort_order)
    : [
        { section_key: 'hero', is_active: true },
        { section_key: 'stats', is_active: true },
        { section_key: 'aarti', is_active: true },
        { section_key: 'events', is_active: true },
        { section_key: 'donate', is_active: true },
        { section_key: 'history', is_active: true },
        { section_key: 'testimonials', is_active: true }
      ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden pt-0">
      {orderedSections.map((sec) => (
        <VisualSectionRenderer
          key={sec.id || sec.section_key}
          section={sec}
          mode="live"
          language={language as 'gu' | 'hi' | 'en'}
        />
      ))}
    </div>
  );
}
