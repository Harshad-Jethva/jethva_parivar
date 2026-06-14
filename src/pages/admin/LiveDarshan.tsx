import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Video, VideoOff, Globe, Play, Calendar, Plus, Trash2 } from 'lucide-react';

interface PredefinedVideo {
  title: string;
  url: string;
}

export function LiveDarshan() {
  const [isLive, setIsLive] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [streamStartTime, setStreamStartTime] = useState('');
  const [streamEndTime, setStreamEndTime] = useState('');
  
  // Predefined playlists
  const [youtubeVideos, setYoutubeVideos] = useState<PredefinedVideo[]>([]);
  const [facebookVideos, setFacebookVideos] = useState<PredefinedVideo[]>([]);
  const [instagramVideos, setInstagramVideos] = useState<PredefinedVideo[]>([]);
  
  // Editor state
  const [activeTab, setActiveTab] = useState<'youtube' | 'facebook' | 'instagram'>('youtube');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadLiveSettings();
  }, []);

  const loadLiveSettings = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        data.forEach((item: any) => {
          if (item.key === 'darshan_live') setIsLive(item.value === 'true');
          if (item.key === 'youtube_live_url') setYoutubeUrl(item.value || '');
          if (item.key === 'facebook_page') setFacebookUrl(item.value || '');
          if (item.key === 'instagram_live_url') setInstagramUrl(item.value || '');
          if (item.key === 'darshan_start') setStreamStartTime(item.value || '');
          if (item.key === 'darshan_end') setStreamEndTime(item.value || '');
          
          if (item.key === 'youtube_predefined_videos') {
            try {
              setYoutubeVideos(JSON.parse(item.value) || []);
            } catch (e) {
              setYoutubeVideos([]);
            }
          }
          if (item.key === 'facebook_predefined_videos') {
            try {
              setFacebookVideos(JSON.parse(item.value) || []);
            } catch (e) {
              setFacebookVideos([]);
            }
          }
          if (item.key === 'instagram_predefined_videos') {
            try {
              setInstagramVideos(JSON.parse(item.value) || []);
            } catch (e) {
              setInstagramVideos([]);
            }
          }
        });
      }
    } catch (err) {
      console.error('Error loading live settings:', err);
    }
  };

  const saveLiveSettings = async () => {
    setIsSaving(true);
    try {
      const settings = [
        { key: 'darshan_live', value: String(isLive) },
        { key: 'youtube_live_url', value: youtubeUrl },
        { key: 'facebook_page', value: facebookUrl },
        { key: 'instagram_live_url', value: instagramUrl },
        { key: 'darshan_start', value: streamStartTime },
        { key: 'darshan_end', value: streamEndTime },
        { key: 'youtube_predefined_videos', value: JSON.stringify(youtubeVideos) },
        { key: 'facebook_predefined_videos', value: JSON.stringify(facebookVideos) },
        { key: 'instagram_predefined_videos', value: JSON.stringify(instagramVideos) },
      ];

      for (const item of settings) {
        const { data } = await supabase.from('site_settings').select('id').eq('key', item.key);
        if (data && data.length > 0) {
          await supabase.from('site_settings').update({ value: item.value }, data[0].id);
        } else {
          await supabase.from('site_settings').insert(item);
        }
      }

      setMessage({ type: 'success', text: 'Live Darshan & video settings updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const getActiveVideosList = () => {
    if (activeTab === 'youtube') return youtubeVideos;
    if (activeTab === 'facebook') return facebookVideos;
    return instagramVideos;
  };

  const handleAddVideo = () => {
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;
    const newVideo = { title: newVideoTitle.trim(), url: newVideoUrl.trim() };
    
    if (activeTab === 'youtube') {
      setYoutubeVideos([...youtubeVideos, newVideo]);
    } else if (activeTab === 'facebook') {
      setFacebookVideos([...facebookVideos, newVideo]);
    } else {
      setInstagramVideos([...instagramVideos, newVideo]);
    }
    
    setNewVideoTitle('');
    setNewVideoUrl('');
  };

  const handleDeleteVideo = (index: number) => {
    if (activeTab === 'youtube') {
      setYoutubeVideos(youtubeVideos.filter((_, idx) => idx !== index));
    } else if (activeTab === 'facebook') {
      setFacebookVideos(facebookVideos.filter((_, idx) => idx !== index));
    } else {
      setInstagramVideos(instagramVideos.filter((_, idx) => idx !== index));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Live Broadcast & Video Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Toggle live feeds, configure stream URLs, and manage past videos for YouTube, Facebook, and Instagram.</p>
        </div>
        <button
          onClick={saveLiveSettings}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white rounded-lg transition-colors font-medium shadow"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Stream Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Status Toggle */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary-500" />
              Broadcast Status
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-400 dark:bg-gray-800'}`}>
                  {isLive ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-white block">Enable Live Streaming Widget</span>
                  <span className="text-xs text-gray-400 block">Determines if the video stream player is displayed on the main website pages.</span>
                </div>
              </div>

              <button
                onClick={() => setIsLive(!isLive)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm ${
                  isLive 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {isLive ? 'BROADCASTING' : 'OFFLINE'}
              </button>
            </div>
          </div>

          {/* URLs & Channels Config */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-primary-500" />
              Live Stream Sources
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">YouTube Live Stream URL</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Facebook Live Broadcast Page URL</label>
                <input
                  type="text"
                  placeholder="https://www.facebook.com/..."
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Instagram Live Broadcast URL</label>
                <input
                  type="text"
                  placeholder="https://www.instagram.com/..."
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Predefined Videos Lists */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 dark:border-gray-700">
              <h3 className="text-md font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-primary-500" />
                Predefined Video Playlists
              </h3>
              
              {/* Tabs for platforms */}
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg border dark:border-gray-750">
                {(['youtube', 'facebook', 'instagram'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActiveTab(p)}
                    className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition-colors ${
                      activeTab === p
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* List of current videos for the active tab */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-gray-400 uppercase">
                {activeTab} Predefined Videos ({getActiveVideosList().length})
              </span>
              
              {getActiveVideosList().length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed dark:border-gray-700">
                  No predefined videos added for {activeTab} yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {getActiveVideosList().map((vid, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg dark:border-gray-700 text-xs gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-gray-800 dark:text-white block truncate">{vid.title}</span>
                        <span className="text-[10px] text-gray-400 block truncate font-mono">{vid.url}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(idx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-950/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form to add a new predefined video */}
            <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border dark:border-gray-700 space-y-3">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Add New Predefined Video</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Video Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Maha Aarti Celebration 2026"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    className="w-full px-3 py-1.5 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Video Link/URL</label>
                  <input
                    type="text"
                    placeholder="e.g. https://youtube.com/watch?v=..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="w-full px-3 py-1.5 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleAddVideo}
                disabled={!newVideoTitle.trim() || !newVideoUrl.trim()}
                className="w-full py-2 bg-gray-800 hover:bg-gray-750 text-white disabled:opacity-50 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Video to {activeTab} Playlist
              </button>
            </div>
          </div>

          {/* Timing Limits */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              Broadcast Schedule
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Daily Stream Start Time</label>
                <input
                  type="time"
                  value={streamStartTime}
                  onChange={(e) => setStreamStartTime(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs text-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Daily Stream End Time</label>
                <input
                  type="time"
                  value={streamEndTime}
                  onChange={(e) => setStreamEndTime(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs text-gray-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Live Simulator View */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Stream Widget Render</h3>
            
            <div className="bg-gray-950 rounded-xl overflow-hidden relative aspect-video border dark:border-gray-900 shadow flex flex-col justify-center items-center">
              {isLive ? (
                <>
                  <div className="absolute top-2 left-2 bg-red-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    LIVE BROADCAST
                  </div>
                  <Play className="w-10 h-10 text-white/80 hover:text-white cursor-pointer hover:scale-110 transition-transform" />
                  <span className="text-[10px] text-gray-400 mt-2">Active Live Stream Running</span>
                </>
              ) : (
                <>
                  <VideoOff className="w-8 h-8 text-gray-600 mb-2" />
                  <span className="text-xs text-gray-500 font-semibold">Darshan Offline</span>
                  <span className="text-[9px] text-gray-600 mt-0.5">Stream is currently disabled</span>
                </>
              )}
            </div>

            <div className="text-[10px] text-gray-400 mt-3 text-center">
              Active Stream Target: {youtubeUrl ? 'YouTube' : facebookUrl ? 'Facebook' : instagramUrl ? 'Instagram' : 'None'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
