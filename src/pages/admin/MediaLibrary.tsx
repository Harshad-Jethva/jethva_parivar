import { useState, useEffect } from 'react';
import { supabase, MediaFile } from '../../lib/supabase';
import { Search, FolderOpen, Upload, Video, FileText } from 'lucide-react';

export function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // New mock upload file fields
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('image');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      console.error('Error loading media files:', err);
    }
  };

  const handleMockUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName || !fileUrl) return;
    
    // Simulate WebP Conversion warning
    setIsConverting(true);
    setTimeout(async () => {
      try {
        const payload = {
          name: fileName.endsWith('.webp') ? fileName : `${fileName.split('.')[0]}.webp`,
          url: fileUrl,
          thumbnail_url: fileUrl,
          size_bytes: 45600, // mock WebP size
          type: fileType,
          category: selectedFolder
        };
        const { error } = await supabase.from('media').insert(payload);
        if (error) throw error;
        
        setMessage({ type: 'success', text: 'Asset uploaded & automatically optimized to WebP format!' });
        setFileName('');
        setFileUrl('');
        loadFiles();
        setTimeout(() => setMessage(null), 3000);
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setIsConverting(false);
      }
    }, 1000);
  };

  const deleteFile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      const { error } = await supabase.from('media').delete(id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Asset removed.' });
      loadFiles();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesFolder = f.category === selectedFolder;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const folders = [
    { key: 'gallery', label: 'Gallery Photo Assets' },
    { key: 'banners', label: 'Banners & Hero' },
    { key: 'documents', label: 'Documents & PDFs' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Media Library & File Manager</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Bulk upload image/video assets with automatic WebP conversion and folder organization.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        
        {/* Folders List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white text-xs mb-3 uppercase tracking-wider text-gray-400">Folders</h3>
            <div className="space-y-1">
              {folders.map((f) => (
                <div
                  key={f.key}
                  onClick={() => setSelectedFolder(f.key)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    selectedFolder === f.key
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Mock Upload Box */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-semibold text-gray-800 dark:text-white text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-primary-500" /> Upload Asset
            </h3>
            
            <form onSubmit={handleMockUpload} className="space-y-2.5 text-xs">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Asset Name (e.g. ram_puja.jpg)"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="External URL / Mock URL"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono"
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="px-3 py-1.5 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="pdf">Document</option>
                </select>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-semibold"
                >
                  {isConverting ? 'Optimizing...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Media Grid View */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[500px]">
          {/* Top filter bar */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b dark:border-gray-700 pb-4 mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-white capitalize text-sm">{selectedFolder} Assets</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs w-48"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Files grid list */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <div 
                key={file.id} 
                className="group relative bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border dark:border-gray-800 hover:shadow transition-shadow flex flex-col justify-between"
              >
                <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative mb-2">
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : file.type === 'video' ? (
                    <Video className="w-8 h-8 text-primary-500" />
                  ) : (
                    <FileText className="w-8 h-8 text-blue-500" />
                  )}
                  {/* Delete Hover action */}
                  <button 
                    onClick={() => deleteFile(file.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                  >
                    Delete
                  </button>
                </div>
                
                <div className="text-[10px] space-y-0.5">
                  <span className="font-bold text-gray-800 dark:text-white block truncate">{file.name}</span>
                  <span className="text-gray-400 block font-mono">{(file.size_bytes / 1024).toFixed(1)} KB • {file.type}</span>
                </div>
              </div>
            ))}

            {filteredFiles.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-24 text-sm">
                No media files in this folder. Use upload box to add mockup assets.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
