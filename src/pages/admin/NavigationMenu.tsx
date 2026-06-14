import { useState, useEffect } from 'react';
import { supabase, Menu } from '../../lib/supabase';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';

export function NavigationMenu() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  // New item input
  const [labelEn, setLabelEn] = useState('');
  const [labelGu, setLabelGu] = useState('');
  const [labelHi, setLabelHi] = useState('');
  const [path, setPath] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadMenus();
  }, []);

  useEffect(() => {
    if (selectedMenu) {
      setMenuItems(selectedMenu.items || []);
    }
  }, [selectedMenu]);

  const loadMenus = async () => {
    try {
      const { data, error } = await supabase.from('menus').select('*');
      if (error) throw error;
      setMenus(data || []);
      if (data && data.length > 0 && !selectedMenu) {
        setSelectedMenu(data[0]);
      }
    } catch (err) {
      console.error('Error loading menus:', err);
    }
  };

  const saveMenuItems = async () => {
    if (!selectedMenu) return;
    try {
      const { error } = await supabase.from('menus').update({ items: menuItems }, selectedMenu.id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Navigation menu hierarchy saved successfully!' });
      loadMenus();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const addItem = () => {
    if (!labelEn || !path) return;
    const newItem = {
      label_en: labelEn,
      label_gu: labelGu || labelEn,
      label_hi: labelHi || labelEn,
      path: path
    };
    setMenuItems([...menuItems, newItem]);
    setLabelEn('');
    setLabelGu('');
    setLabelHi('');
    setPath('');
  };

  const deleteItem = (idx: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== idx));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= menuItems.length) return;
    const list = [...menuItems];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setMenuItems(list);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Navigation Menus Manager</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Build dropdown links, custom header menus, footer submenus and sidebar hierarchies.</p>
        </div>
        <button
          onClick={saveMenuItems}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium shadow"
        >
          <Save className="w-5 h-5" />
          Save Menu
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        
        {/* Left selector */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3 px-2">Navigation Spots</h3>
          <div className="space-y-1">
            {menus.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMenu(m)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors capitalize ${
                  selectedMenu?.id === m.id
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className="text-sm font-medium">{m.menu_key} Menu</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: drag menu builder layout */}
        {selectedMenu && (
          <div className="lg:col-span-3 grid md:grid-cols-12 gap-6">
            
            {/* Hierarchy Builder list */}
            <div className="md:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Menu Item Links</h3>
              
              <div className="space-y-2">
                {menuItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border dark:border-gray-700 text-xs">
                    
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="text-gray-400 hover:text-primary-500 disabled:opacity-30">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => moveItem(idx, 'down')} disabled={idx === menuItems.length - 1} className="text-gray-400 hover:text-primary-500 disabled:opacity-30">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1">
                      <span className="font-bold text-gray-800 dark:text-white block">{item.label_en} ({item.label_gu})</span>
                      <span className="text-[10px] text-gray-400 block font-mono flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> {item.path}
                      </span>
                    </div>

                    <button onClick={() => deleteItem(idx)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Link */}
              <div className="border-t dark:border-gray-700 pt-4 space-y-3">
                <span className="block text-xs font-semibold text-gray-500 uppercase">Add Menu Link</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Label (EN)"
                    value={labelEn}
                    onChange={(e) => setLabelEn(e.target.value)}
                    className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Label (GU)"
                    value={labelGu}
                    onChange={(e) => setLabelGu(e.target.value)}
                    className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Label (HI)"
                    value={labelHi}
                    onChange={(e) => setLabelHi(e.target.value)}
                    className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Path / Destination URL (e.g. /about, /events)"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    className="flex-1 px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono"
                  />
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 text-xs font-bold rounded-lg border border-primary-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </button>
                </div>
              </div>

            </div>

            {/* Sidebar Mock Header preview */}
            <div className="md:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[500px]">
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-3">Live Navigation Layout</h3>
              
              <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 rounded-xl space-y-4 font-sans text-xs border">
                <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-3 rounded-lg border">
                  <span className="font-bold text-gray-800 dark:text-white text-[10px]">MAIN MENU</span>
                  <div className="flex gap-2.5 font-medium text-gray-500 text-[10px]">
                    {menuItems.slice(0, 4).map((m, i) => (
                      <span key={i} className="hover:text-primary-500 cursor-pointer">{m.label_en}</span>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-gray-400">
                  Header and footer links adapt immediately when saved. Reordering shifts rendering list sequence.
                </p>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
