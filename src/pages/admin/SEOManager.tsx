import { useState, useEffect } from 'react';
import { supabase, RedirectRule, FAQ } from '../../lib/supabase';
import { Save, Plus, Trash2, Globe, Bot, HelpCircle, Map } from 'lucide-react';

export function SEOManager() {
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [robotsTxt, setRobotsTxt] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'meta' | 'redirects' | 'faqs' | 'aeo'>('meta');

  // Input states
  const [newFromPath, setNewFromPath] = useState('');
  const [newToPath, setNewToPath] = useState('');
  const [newFaqQEn, setNewFaqQEn] = useState('');
  const [newFaqAEn, setNewFaqAEn] = useState('');
  
  // Google Business local SEO settings
  const [googleAddress, setGoogleAddress] = useState('');
  const [googleCoords, setGoogleCoords] = useState('');
  const [googleTimings, setGoogleTimings] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSEORules();
  }, []);

  const loadSEORules = async () => {
    try {
      const [redirectsRes, faqsRes, settingsRes] = await Promise.all([
        supabase.from('redirects').select('*'),
        supabase.from('faqs').select('*').order('sort_order'),
        supabase.from('site_settings').select('*')
      ]);

      setRedirects(redirectsRes.data || []);
      setFaqs(faqsRes.data || []);

      if (settingsRes.data) {
        settingsRes.data.forEach((item: any) => {
          if (item.key === 'robots_txt') setRobotsTxt(item.value);
          if (item.key === 'address') setGoogleAddress(item.value);
          if (item.key === 'google_coords') setGoogleCoords(item.value);
          if (item.key === 'google_timings') setGoogleTimings(item.value);
        });
      }
    } catch (err) {
      console.error('Error loading SEO components:', err);
    }
  };

  const saveGeneralSEO = async () => {
    setIsSaving(true);
    try {
      const settings = [
        { key: 'robots_txt', value: robotsTxt },
        { key: 'address', value: googleAddress },
        { key: 'google_coords', value: googleCoords },
        { key: 'google_timings', value: googleTimings }
      ];

      for (const item of settings) {
        const { data } = await supabase.from('site_settings').select('id').eq('key', item.key);
        if (data && data.length > 0) {
          await supabase.from('site_settings').update({ value: item.value }, data[0].id);
        } else {
          await supabase.from('site_settings').insert(item);
        }
      }

      setMessage({ type: 'success', text: 'Local SEO & Robots configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRedirect = async () => {
    if (!newFromPath || !newToPath) return;
    try {
      const { error } = await supabase.from('redirects').insert({
        from_path: newFromPath,
        to_path: newToPath,
        status_code: 301
      });
      if (error) throw error;
      setNewFromPath('');
      setNewToPath('');
      loadSEORules();
      setMessage({ type: 'success', text: '301 Redirect Rule added.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteRedirect = async (id: string) => {
    try {
      const { error } = await supabase.from('redirects').delete(id);
      if (error) throw error;
      loadSEORules();
      setMessage({ type: 'success', text: 'Redirect rule deleted.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleAddFaq = async () => {
    if (!newFaqQEn || !newFaqAEn) return;
    try {
      const payload = {
        question_en: newFaqQEn,
        question_gu: newFaqQEn,
        question_hi: newFaqQEn,
        answer_en: newFaqAEn,
        answer_gu: newFaqAEn,
        answer_hi: newFaqAEn,
        category: 'general',
        sort_order: faqs.length + 1
      };
      const { error } = await supabase.from('faqs').insert(payload);
      if (error) throw error;
      setNewFaqQEn('');
      setNewFaqAEn('');
      loadSEORules();
      setMessage({ type: 'success', text: 'FAQ Question Entity added successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      const { error } = await supabase.from('faqs').delete(id);
      if (error) throw error;
      loadSEORules();
      setMessage({ type: 'success', text: 'FAQ removed.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">SEO, Local SEO & AI Optimization (AEO)</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure search rankings, Robots.txt parameters, 301 redirection mappings, and AI schema snippets.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setActiveSubTab('meta')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeSubTab === 'meta'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5"><Map className="w-4 h-4" /> Local SEO & Robots</div>
        </button>
        <button
          onClick={() => setActiveSubTab('redirects')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeSubTab === 'redirects'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5"><Globe className="w-4 h-4" /> 301 Redirects</div>
        </button>
        <button
          onClick={() => setActiveSubTab('faqs')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeSubTab === 'faqs'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5"><HelpCircle className="w-4 h-4" /> Structured FAQs</div>
        </button>
        <button
          onClick={() => setActiveSubTab('aeo')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeSubTab === 'aeo'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5"><Bot className="w-4 h-4" /> AI overview (AEO)</div>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-b-xl shadow-sm border-x border-b border-gray-100 dark:border-gray-700">
        
        {/* Tab 1: Local SEO & Robots */}
        {activeSubTab === 'meta' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Google Business Form */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Google Business Local Profile</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Physical Temple Address</label>
                  <input
                    type="text"
                    value={googleAddress}
                    onChange={(e) => setGoogleAddress(e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Map Coordinates (Lat, Lng)</label>
                  <input
                    type="text"
                    value={googleCoords}
                    onChange={(e) => setGoogleCoords(e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm font-mono text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Standard Timings</label>
                  <input
                    type="text"
                    value={googleTimings}
                    onChange={(e) => setGoogleTimings(e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Robots.txt Editor */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Robots.txt Editor</h3>
                <div>
                  <textarea
                    rows={6}
                    value={robotsTxt}
                    onChange={(e) => setRobotsTxt(e.target.value)}
                    className="w-full p-3 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono text-gray-600"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t dark:border-gray-700">
              <button
                onClick={saveGeneralSEO}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold shadow"
              >
                <Save className="w-4 h-4" /> Save Local SEO
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: 301 Redirect Manager */}
        {activeSubTab === 'redirects' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Redirect Rules (301 Permanent)</h3>
            
            <div className="flex gap-3 max-w-xl">
              <input
                type="text"
                placeholder="From path (e.g. /old-events)"
                value={newFromPath}
                onChange={(e) => setNewFromPath(e.target.value)}
                className="flex-1 px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono"
              />
              <input
                type="text"
                placeholder="To path (e.g. /events)"
                value={newToPath}
                onChange={(e) => setNewToPath(e.target.value)}
                className="flex-1 px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono"
              />
              <button
                onClick={handleAddRedirect}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg text-xs"
              >
                Add Rule
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl overflow-x-auto border dark:border-gray-700 text-xs">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 text-gray-500 font-semibold border-b dark:border-gray-700">
                    <th className="px-4 py-2.5">Source URL</th>
                    <th className="px-4 py-2.5">Target Destination</th>
                    <th className="px-4 py-2.5 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                  {redirects.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-100/40">
                      <td className="px-4 py-2.5 font-mono text-gray-500">{r.from_path}</td>
                      <td className="px-4 py-2.5 font-mono text-primary-500">{r.to_path}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => handleDeleteRedirect(r.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {redirects.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-6 text-gray-400">No redirects mapped.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: FAQ Structured Schema */}
        {activeSubTab === 'faqs' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Knowledge Graph FAQs Schema Builder</h3>
            
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-800">
              <span className="block text-xs font-semibold text-gray-500 uppercase">Add FAQ Block</span>
              <input
                type="text"
                placeholder="Question (e.g. What are the opening hours?)"
                value={newFaqQEn}
                onChange={(e) => setNewFaqQEn(e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
              />
              <textarea
                rows={2}
                placeholder="Answer detail..."
                value={newFaqAEn}
                onChange={(e) => setNewFaqAEn(e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddFaq}
                  className="flex items-center gap-1 px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Save Entity
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {faqs.map((f) => (
                <div key={f.id} className="flex justify-between items-start p-3 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg">
                  <div>
                    <span className="font-bold text-gray-800 dark:text-white block">{f.question_en}</span>
                    <p className="text-gray-400 mt-1">{f.answer_en}</p>
                  </div>
                  <button onClick={() => handleDeleteFaq(f.id)} className="text-gray-400 hover:text-red-500 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: AI Engine Search Optimization (GEO) */}
        {activeSubTab === 'aeo' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">AI Engine Search Engine Optimization (AEO / GEO)</h3>
            
            <div className="grid md:grid-cols-2 gap-6 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              
              {/* ChatGPT entities */}
              <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border dark:border-gray-850">
                <h4 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-1">
                  <Bot className="w-4 h-4 text-primary-500" /> ChatGPT Optimization Rules
                </h4>
                <p className="mb-2">Structured entity relationships to populate the OpenAI Knowledge Graph.</p>
                <div className="bg-gray-950 p-3 rounded font-mono text-[10px] text-gray-400 overflow-x-auto">
                  {`{
  "@context": "https://schema.org",
  "@type": "HinduTemple",
  "name": "Khambhadiya Dham",
  "parentOrganization": "Jethva Family Trust",
  "address": "${googleAddress || ' Ahmedabad, India'}"
}`}
                </div>
              </div>

              {/* Gemini entities */}
              <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border dark:border-gray-850">
                <h4 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-1">
                  <Bot className="w-4 h-4 text-primary-500" /> Google Search AI Overview Targets
                </h4>
                <p className="mb-2">Key phrases for Google Search Generative Experience citation indexing.</p>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>Khambhadiya Dham Jethva family temple history</li>
                  <li>Shree Ram Mandir Ahmedabad daily aarti timings</li>
                  <li>Donate to Shree Ram Mandir gaushala online</li>
                </ul>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
