import { useState, useEffect } from 'react';
import { supabase, Page, PageSection } from '../../lib/supabase';
import { 
  Plus, Trash2, Copy, Save, Eye, EyeOff, Layout, ArrowUp, ArrowDown,
  Monitor, Smartphone, Tablet, Users, Undo2, Redo2, RotateCcw,
  Sparkles, Settings, AlignLeft, Paintbrush, Sliders, Type, Check,
  Link as LinkIcon, Compass, Play, Image as ImageIcon
} from 'lucide-react';
import { VisualSectionRenderer } from '../../components/ui/VisualSectionRenderer';

export function PagesBuilder() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [pageSections, setPageSections] = useState<PageSection[]>([]);
  
  // Undo/Redo History Stacks
  const [history, setHistory] = useState<PageSection[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Layout Viewport State
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Element selection state
  const [selectedElement, setSelectedElement] = useState<{
    type: 'section' | 'button' | 'image' | 'layout';
    sectionId: string;
    path: string;
    data: any;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'visual' | 'settings' | 'seo' | 'visibility'>('visual');
  const [langTab, setLangTab] = useState<'gu' | 'hi' | 'en'>('gu');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Mobile sidebar controls
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      loadPageSections(selectedPage.id, selectedPage.slug);
      setSelectedElement(null);
    }
  }, [selectedPage]);

  // Record a step in undo/redo history
  const recordHistory = (newSections: PageSection[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, JSON.parse(JSON.stringify(newSections))]);
    setHistoryIndex(nextHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setPageSections(JSON.parse(JSON.stringify(history[prevIdx])));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setPageSections(JSON.parse(JSON.stringify(history[nextIdx])));
    }
  };

  const loadPages = async () => {
    try {
      const { data, error } = await supabase.from('pages').select('*');
      if (error) throw error;
      setPages(data || []);
      if (data && data.length > 0 && !selectedPage) {
        setSelectedPage(data[0]);
      }
    } catch (err) {
      console.error('Error loading pages:', err);
    }
  };

  const loadPageSections = async (pageId: string, slug?: string) => {
    try {
      const { data, error } = await supabase.from('page_sections').select('*').eq('page_id', pageId).order('sort_order');
      if (error) throw error;
      let loadedSections = data || [];

      // Auto-seed default sections if database has no sections for this page slug
      if (loadedSections.length === 0 && slug) {
        const defaultSectionsMap: Record<string, Array<{key: string, title: string}>> = {
          about: [
            { key: 'about_details', title: 'About Us Details' },
            { key: 'history', title: 'Temple History' }
          ],
          contact: [
            { key: 'contact_details', title: 'Contact Details & Form' }
          ],
          donate: [
            { key: 'donate', title: 'Donation Call to Action' }
          ],
          events: [
            { key: 'events', title: 'Featured Events' }
          ],
          services: [
            { key: 'aarti', title: 'Aarti Timings' }
          ],
          gallery: [
            { key: 'gallery', title: 'Photo Gallery Grid' }
          ]
        };

        const defaults = defaultSectionsMap[slug];
        if (defaults) {
          for (let i = 0; i < defaults.length; i++) {
            const newSec = {
              page_id: pageId,
              section_key: defaults[i].key,
              title_en: defaults[i].title,
              title_gu: defaults[i].title,
              title_hi: defaults[i].title,
              sort_order: i + 1,
              is_active: true,
              device_visibility: ['desktop', 'mobile', 'tablet'],
              role_visibility: ['guest', 'member', 'admin'],
              language_visibility: ['en', 'gu', 'hi'],
              content: {}
            };
            await supabase.from('page_sections').insert(newSec);
          }
          const reloadRes = await supabase.from('page_sections').select('*').eq('page_id', pageId).order('sort_order');
          loadedSections = reloadRes.data || [];
        }
      }

      setPageSections(loadedSections);
      setHistory([JSON.parse(JSON.stringify(loadedSections))]);
      setHistoryIndex(0);
    } catch (err) {
      console.error('Error loading page sections:', err);
    }
  };

  // Update a single section's content (WYSIWYG callback)
  const handleUpdateSectionContent = (sectionId: string, updatedContent: any) => {
    const updatedList = pageSections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, content: updatedContent };
      }
      return sec;
    });
    setPageSections(updatedList);
    recordHistory(updatedList);
  };

  // Save changes to database (Publish)
  const handlePublishAll = async () => {
    if (!selectedPage) return;
    try {
      await Promise.all(
        pageSections.map(sec => 
          supabase.from('page_sections').update({
            content: sec.content,
            is_active: sec.is_active,
            sort_order: sec.sort_order,
            device_visibility: sec.device_visibility,
            role_visibility: sec.role_visibility,
            language_visibility: sec.language_visibility,
            festival_mode: sec.festival_mode
          }, sec.id)
        )
      );
      setMessage({ type: 'success', text: 'All drafts published successfully! Site is live.' });
      loadPageSections(selectedPage.id);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save sections.' });
    }
  };

  const handleAddSection = async () => {
    if (!selectedPage) return;
    const key = prompt('Enter a unique key for the new section (e.g. hero, history, stats, aarti):');
    if (!key) return;
    try {
      const newSec = {
        page_id: selectedPage.id,
        section_key: key.toLowerCase().replace(/[^a-z0-9-_]/g, ''),
        title_en: key.charAt(0).toUpperCase() + key.slice(1),
        title_gu: key,
        title_hi: key,
        sort_order: pageSections.length + 1,
        is_active: true,
        device_visibility: ['desktop', 'mobile', 'tablet'],
        role_visibility: ['guest', 'member', 'admin'],
        language_visibility: ['en', 'gu', 'hi'],
        content: {}
      };
      const { error } = await supabase.from('page_sections').insert(newSec);
      if (error) throw error;
      loadPageSections(selectedPage.id);
      setMessage({ type: 'success', text: 'New section added!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pageSections.length) return;

    const list = [...pageSections];
    const temp = list[index].sort_order;
    list[index].sort_order = list[targetIndex].sort_order;
    list[targetIndex].sort_order = temp;

    const sortedList = [...list].sort((a, b) => a.sort_order - b.sort_order);
    setPageSections(sortedList);
    recordHistory(sortedList);
  };

  const duplicateSection = async (section: PageSection) => {
    try {
      const copy = {
        page_id: section.page_id,
        section_key: `${section.section_key}_copy_${Date.now().toString().slice(-3)}`,
        title_en: `${section.title_en} (Copy)`,
        title_gu: `${section.title_gu} (નકલ)`,
        title_hi: `${section.title_hi} (प्रतिलिपि)`,
        content: section.content,
        sort_order: pageSections.length + 1,
        is_active: section.is_active,
        device_visibility: section.device_visibility,
        role_visibility: section.role_visibility,
        language_visibility: section.language_visibility,
        festival_mode: section.festival_mode
      };
      const { error } = await supabase.from('page_sections').insert(copy);
      if (error) throw error;
      loadPageSections(selectedPage!.id);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      const { error } = await supabase.from('page_sections').delete(sectionId);
      if (error) throw error;
      loadPageSections(selectedPage!.id);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Helper to get/set nested property
  const getNested = (obj: any, path: string) => {
    if (!path) return obj;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const setNested = (obj: any, path: string, val: any) => {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = val;
    return obj;
  };

  const updateSelectedElementValue = (key: string, value: any) => {
    if (!selectedElement) return;
    const { sectionId, path } = selectedElement;
    const section = pageSections.find(s => s.id === sectionId);
    if (!section) return;

    const newContent = JSON.parse(JSON.stringify(section.content || {}));
    
    if (selectedElement.type === 'button') {
      setNested(newContent, `${path}.${key}`, value);
    } else if (selectedElement.type === 'image') {
      if (key === 'url') {
        setNested(newContent, path, value);
      } else {
        setNested(newContent, `${path}_${key}`, value);
      }
    } else if (selectedElement.type === 'layout') {
      if (key === 'text') {
        setNested(newContent, path, value);
      } else {
        if (!newContent.layout) newContent.layout = {};
        newContent.layout[key] = value;
      }
    } else if (selectedElement.type === 'section') {
      if (key.startsWith('layout.')) {
        if (!newContent.layout) newContent.layout = {};
        newContent.layout[key.split('.')[1]] = value;
      } else {
        section[key as keyof PageSection] = value;
      }
    }

    handleUpdateSectionContent(sectionId, newContent);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-6 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Visual Header Control Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-950/20 text-primary-500 rounded-lg">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-md font-bold text-gray-800 dark:text-white flex items-center gap-2">
              Visual Website Page Builder
              <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full font-semibold">WYSIWYG Mode</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Click elements directly in the live preview to customize styling, visibility, and buttons.</p>
          </div>
        </div>

        {/* Viewport Resizer Toggles */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button 
            onClick={() => setViewportMode('desktop')} 
            className={`p-1.5 rounded transition-all ${viewportMode === 'desktop' ? 'bg-white dark:bg-gray-600 text-primary-500 shadow-sm' : 'text-gray-500'}`}
            title="Desktop Mode"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewportMode('tablet')} 
            className={`p-1.5 rounded transition-all ${viewportMode === 'tablet' ? 'bg-white dark:bg-gray-600 text-primary-500 shadow-sm' : 'text-gray-500'}`}
            title="Tablet Mode"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewportMode('mobile')} 
            className={`p-1.5 rounded transition-all ${viewportMode === 'mobile' ? 'bg-white dark:bg-gray-600 text-primary-500 shadow-sm' : 'text-gray-500'}`}
            title="Mobile Mode"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Toggles for Mobile/Tablet */}
        <div className="flex lg:hidden items-center gap-1.5 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button 
            onClick={() => { setShowLeftSidebar(!showLeftSidebar); setShowRightSidebar(false); }} 
            className={`px-2 py-1 rounded text-xs transition-all ${showLeftSidebar ? 'bg-white dark:bg-gray-600 text-primary-500 shadow-sm' : 'text-gray-500'}`}
            title="Toggle Pages & Sections Layout Tree"
          >
            Pages
          </button>
          <button 
            onClick={() => { setShowRightSidebar(!showRightSidebar); setShowLeftSidebar(false); }} 
            className={`px-2 py-1 rounded text-xs transition-all ${showRightSidebar ? 'bg-white dark:bg-gray-600 text-primary-500 shadow-sm' : 'text-gray-500'}`}
            title="Toggle Inspector Properties"
          >
            Inspect
          </button>
        </div>

        {/* Undo/Redo & Save controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-3">
            <button 
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 disabled:opacity-40"
              title="Undo Change"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button 
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 disabled:opacity-40"
              title="Redo Change"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddSection}
            className="px-3.5 py-1.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>

          <button
            onClick={handlePublishAll}
            className="px-4 py-1.8 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Save & Publish Live
          </button>
        </div>
      </div>

      {message && (
        <div className={`m-4 p-3 rounded-lg text-xs font-semibold ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Main Workspace Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Drawer: Page List & Outline */}
        <div className={`w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full z-30 lg:z-10 transition-transform duration-300 ${
          showLeftSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } absolute lg:static left-0 top-0 bottom-0 shadow-lg lg:shadow-none`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pages list</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {pages.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPage(p);
                  setShowLeftSidebar(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs font-semibold transition-all ${
                  selectedPage?.id === p.id 
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className="truncate">{p.title_en}</span>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded uppercase font-mono text-gray-500">
                  /{p.slug}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Sections layout tree</span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {pageSections.map((sec, idx) => (
                <div key={sec.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 text-[11px]">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 truncate w-24">{sec.title_en}</span>
                  <div className="flex gap-1">
                    <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-primary-500 disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => moveSection(idx, 'down')} disabled={idx === pageSections.length - 1} className="p-0.5 text-gray-400 hover:text-primary-500 disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                    <button onClick={() => deleteSection(sec.id)} className="p-0.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Live WYSIWYG Preview Canvas Frame */}
        <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900/60 p-2 sm:p-4 lg:p-8 flex justify-center items-start">
          <div 
            className="transition-all duration-300 bg-white dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            style={{
              width: viewportMode === 'mobile' ? '375px' : viewportMode === 'tablet' ? '768px' : '100%',
              minHeight: '650px'
            }}
          >
            {/* Virtual Device Frame Top Banner */}
            <div className="bg-gray-950 text-white px-4 py-2 flex justify-between items-center text-xs font-mono select-none">
              <span className="text-[10px] text-gray-400">Preview: {selectedPage?.title_en} Page</span>
              <span className="text-[10px] bg-green-600 text-white font-bold px-2 py-0.2 rounded uppercase tracking-widest scale-90">Live Sync</span>
            </div>

            {/* Canvas Render Loop */}
            <div className="bg-white dark:bg-gray-900 min-h-[600px] outline-none">
              {selectedPage && pageSections.map((sec) => (
                <VisualSectionRenderer
                  key={sec.id}
                  section={sec}
                  mode="edit"
                  language={langTab}
                  onUpdateSection={handleUpdateSectionContent}
                  onSelectElement={(el) => {
                    setSelectedElement(el);
                    // Automatically show right sidebar on mobile when an element is selected
                    setShowRightSidebar(true);
                  }}
                  selectedPath={selectedElement ? `${selectedElement.sectionId}.${selectedElement.path}` : undefined}
                />
              ))}

              {pageSections.length === 0 && (
                <div className="text-center py-20 text-gray-400 space-y-4">
                  <Layout className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="text-sm">No sections on this page. Add your first section to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Advanced Property Inspector */}
        <div className={`w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full z-30 lg:z-10 transition-transform duration-300 ${
          showRightSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } absolute lg:static right-0 top-0 bottom-0 shadow-lg lg:shadow-none`}>
          
          {/* Tabs for Sidebar inspector */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button 
              onClick={() => setActiveTab('visual')}
              className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all ${
                activeTab === 'visual' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400'
              }`}
            >
              Visual Inspector
            </button>
            <button 
              onClick={() => setActiveTab('seo')}
              className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all ${
                activeTab === 'seo' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400'
              }`}
            >
              SEO / Meta
            </button>
          </div>

          {/* Content tabs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Visual Inspector Tab */}
            {activeTab === 'visual' && (
              <div className="space-y-5">
                {/* Selection details */}
                {!selectedElement ? (
                  <div className="text-center py-12 text-gray-400 space-y-2">
                    <Sliders className="w-8 h-8 mx-auto text-gray-300" />
                    <p className="text-xs">Select any section, image, button, or text in the live preview to edit its design system tokens.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Element Header */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase">Selected: {selectedElement.type}</span>
                      <button onClick={() => setSelectedElement(null)} className="text-[10px] text-primary-500 font-bold hover:underline">Clear</button>
                    </div>

                    {/* TEXT editing */}
                    {selectedElement.type === 'layout' && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-gray-400 uppercase">Inline Text Value</label>
                        <textarea
                          rows={4}
                          value={selectedElement.data.text}
                          onChange={(e) => {
                            setSelectedElement({
                              ...selectedElement,
                              data: { ...selectedElement.data, text: e.target.value }
                            });
                            updateSelectedElementValue('text', e.target.value);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                        />
                      </div>
                    )}

                    {/* BUTTON Config */}
                    {selectedElement.type === 'button' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Button Text</label>
                          <input
                            type="text"
                            value={selectedElement.data.text}
                            onChange={(e) => {
                              setSelectedElement({ ...selectedElement, data: { ...selectedElement.data, text: e.target.value } });
                              updateSelectedElementValue('text', e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Redirect Link</label>
                          <input
                            type="text"
                            value={selectedElement.data.link}
                            onChange={(e) => {
                              setSelectedElement({ ...selectedElement, data: { ...selectedElement.data, link: e.target.value } });
                              updateSelectedElementValue('link', e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Button Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={selectedElement.data.color || '#FF6B00'}
                              onChange={(e) => {
                                setSelectedElement({ ...selectedElement, data: { ...selectedElement.data, color: e.target.value } });
                                updateSelectedElementValue('color', e.target.value);
                              }}
                              className="w-8 h-8 rounded cursor-pointer border border-gray-200 bg-white"
                            />
                            <input
                              type="text"
                              value={selectedElement.data.color || '#FF6B00'}
                              onChange={(e) => {
                                setSelectedElement({ ...selectedElement, data: { ...selectedElement.data, color: e.target.value } });
                                updateSelectedElementValue('color', e.target.value);
                              }}
                              className="w-24 px-2.5 py-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedElement.data.visible}
                              onChange={(e) => {
                                setSelectedElement({ ...selectedElement, data: { ...selectedElement.data, visible: e.target.checked } });
                                updateSelectedElementValue('_visible', e.target.checked);
                              }}
                              className="rounded text-primary-500"
                            />
                            Show Button Element
                          </label>
                        </div>
                      </div>
                    )}

                    {/* IMAGE Config */}
                    {selectedElement.type === 'image' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Image URL</label>
                          <textarea
                            rows={3}
                            value={selectedElement.data.url}
                            onChange={(e) => {
                              setSelectedElement({ ...selectedElement, data: { ...selectedElement.data, url: e.target.value } });
                              updateSelectedElementValue('url', e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Alt Accessibility Text</label>
                          <input
                            type="text"
                            value={selectedElement.data.alt}
                            onChange={(e) => {
                              setSelectedElement({ ...selectedElement, data: { ...selectedElement.data, alt: e.target.value } });
                              updateSelectedElementValue('alt', e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* SECTION Properties */}
                    {selectedElement.type === 'section' && (
                      <div className="space-y-5">
                        
                        {/* Section name and toggles */}
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Section Title</label>
                          <input
                            type="text"
                            value={selectedElement.data.title_en || ''}
                            onChange={(e) => {
                              setSelectedElement({ ...selectedElement, data: { ...selectedElement.data, title_en: e.target.value } });
                              updateSelectedElementValue('title_en', e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                          />
                        </div>

                        {/* Visibility and schedules */}
                        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <span className="block text-xs font-bold text-gray-400 uppercase">Visibility Controls</span>
                          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedElement.data.is_active}
                              onChange={(e) => {
                                setSelectedElement({ ...selectedElement, data: { ...selectedElement.data, is_active: e.target.checked } });
                                updateSelectedElementValue('is_active', e.target.checked);
                              }}
                              className="rounded text-primary-500"
                            />
                            Active & Live
                          </label>

                          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedElement.data.festival_mode}
                              onChange={(e) => {
                                setSelectedElement({ ...selectedElement, data: { ...selectedElement.data, festival_mode: e.target.checked } });
                                updateSelectedElementValue('festival_mode', e.target.checked);
                              }}
                              className="rounded text-primary-500"
                            />
                            Festival Mode Overlay
                          </label>
                        </div>

                        {/* Visual styling controls */}
                        <div className="space-y-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <span className="block text-xs font-bold text-gray-400 uppercase">Layout Styling</span>
                          
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">Padding (e.g. 24px, 1.5rem)</label>
                            <input
                              type="text"
                              value={selectedElement.data.content?.layout?.padding || ''}
                              onChange={(e) => updateSelectedElementValue('layout.padding', e.target.value)}
                              placeholder="24px"
                              className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">Margin</label>
                            <input
                              type="text"
                              value={selectedElement.data.content?.layout?.margin || ''}
                              onChange={(e) => updateSelectedElementValue('layout.margin', e.target.value)}
                              placeholder="0px auto"
                              className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">Custom Background Code</label>
                            <input
                              type="text"
                              value={selectedElement.data.content?.layout?.background || ''}
                              onChange={(e) => updateSelectedElementValue('layout.background', e.target.value)}
                              placeholder="linear-gradient(...)"
                              className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">Border Radius</label>
                            <input
                              type="text"
                              value={selectedElement.data.content?.layout?.borderRadius || ''}
                              onChange={(e) => updateSelectedElementValue('layout.borderRadius', e.target.value)}
                              placeholder="12px"
                              className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* SEO Tab Content */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
                  {(['gu', 'hi', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLangTab(lang)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        langTab === lang ? 'bg-white dark:bg-gray-800 text-primary-500' : 'text-gray-500'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase mb-1">Page Title ({langTab})</label>
                    <input
                      type="text"
                      value={selectedPage ? (selectedPage as any)[`title_${langTab}`] || '' : ''}
                      onChange={async (e) => {
                        const val = e.target.value;
                        const updated = { ...selectedPage, [`title_${langTab}`]: val };
                        await supabase.from('pages').update(updated, selectedPage!.id);
                        setSelectedPage(updated as Page);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-400 uppercase mb-1">Meta SEO Title ({langTab})</label>
                    <input
                      type="text"
                      value={selectedPage ? (selectedPage as any)[`seo_title_${langTab}`] || '' : ''}
                      onChange={async (e) => {
                        const val = e.target.value;
                        const updated = { ...selectedPage, [`seo_title_${langTab}`]: val };
                        await supabase.from('pages').update(updated, selectedPage!.id);
                        setSelectedPage(updated as Page);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-400 uppercase mb-1">Meta SEO Description ({langTab})</label>
                    <textarea
                      rows={4}
                      value={selectedPage ? (selectedPage as any)[`seo_description_${langTab}`] || '' : ''}
                      onChange={async (e) => {
                        const val = e.target.value;
                        const updated = { ...selectedPage, [`seo_description_${langTab}`]: val };
                        await supabase.from('pages').update(updated, selectedPage!.id);
                        setSelectedPage(updated as Page);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="p-4 border-t border-gray-150 dark:border-gray-700 text-center text-[10px] text-gray-400">
            Enterprise Website Builder v2.0
          </div>
        </div>

        {/* Sidebar Overlays on Mobile */}
        {showLeftSidebar && (
          <div 
            className="fixed inset-0 bg-black/25 z-20 lg:hidden"
            onClick={() => setShowLeftSidebar(false)}
          />
        )}
        {showRightSidebar && (
          <div 
            className="fixed inset-0 bg-black/25 z-20 lg:hidden"
            onClick={() => setShowRightSidebar(false)}
          />
        )}

      </div>
    </div>
  );
}
