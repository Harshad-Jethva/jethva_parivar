import { useState, useEffect } from 'react';
import { 
  Youtube, 
  Facebook, 
  Instagram, 
  Radio, 
  Play, 
  Share2, 
  ExternalLink, 
  Clock, 
  Video, 
  AlertCircle 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface PredefinedVideo {
  title: string;
  url: string;
}

export function BroadcastPage() {
  const { language } = useLanguage();
  const [platform, setPlatform] = useState<'youtube' | 'facebook' | 'instagram'>('youtube');
  const [mode, setMode] = useState<'live' | 'archive'>('live');
  const [isLive, setIsLive] = useState(false);
  
  // Settings loaded from DB
  const [youtubeLiveUrl, setYoutubeLiveUrl] = useState('');
  const [facebookLiveUrl, setFacebookLiveUrl] = useState('');
  const [instagramLiveUrl, setInstagramLiveUrl] = useState('');
  const [youtubeVideos, setYoutubeVideos] = useState<PredefinedVideo[]>([]);
  const [facebookVideos, setFacebookVideos] = useState<PredefinedVideo[]>([]);
  const [instagramVideos, setInstagramVideos] = useState<PredefinedVideo[]>([]);
  
  const [streamStartTime, setStreamStartTime] = useState('');
  const [streamEndTime, setStreamEndTime] = useState('');
  
  const [selectedArchiveVideo, setSelectedArchiveVideo] = useState<PredefinedVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBroadcastSettings();
  }, []);

  const loadBroadcastSettings = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        data.forEach((item: any) => {
          if (item.key === 'darshan_live') setIsLive(item.value === 'true');
          if (item.key === 'youtube_live_url') setYoutubeLiveUrl(item.value || '');
          if (item.key === 'facebook_page') setFacebookLiveUrl(item.value || '');
          if (item.key === 'instagram_live_url') setInstagramLiveUrl(item.value || '');
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
    } catch (error) {
      console.error('Error loading broadcast settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract YouTube ID
  const getYouTubeId = (url: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|live\/)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  // Get Facebook Embed URL
  const getFacebookEmbedUrl = (url: string) => {
    if (!url) return '';
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`;
  };

  // Get Instagram Embed URL
  const getInstagramEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regExp);
    if (match && match[2]) {
      return `https://www.instagram.com/${match[1]}/${match[2]}/embed`;
    }
    return '';
  };

  const getActiveVideos = () => {
    if (platform === 'youtube') return youtubeVideos;
    if (platform === 'facebook') return facebookVideos;
    return instagramVideos;
  };

  const getActiveLiveUrl = () => {
    if (platform === 'youtube') return youtubeLiveUrl;
    if (platform === 'facebook') return facebookLiveUrl;
    return instagramLiveUrl;
  };

  const handleSelectPlatform = (plat: 'youtube' | 'facebook' | 'instagram') => {
    setPlatform(plat);
    setSelectedArchiveVideo(null);
    setMode('live');
  };

  const handleSelectVideo = (video: PredefinedVideo) => {
    setSelectedArchiveVideo(video);
    setMode('archive');
  };

  // Render video player
  const renderPlayer = () => {
    if (mode === 'live') {
      const liveUrl = getActiveLiveUrl();

      if (!isLive) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-950/80 rounded-2xl border border-gray-800 backdrop-blur">
            <Radio className="w-16 h-16 text-gray-500 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'gu' ? 'લાઇવ પ્રસારણ બંધ છે' : language === 'hi' ? 'लाइव प्रसारण बंद है' : 'Live Broadcast is Offline'}
            </h3>
            <p className="text-sm text-gray-400 max-w-md mb-6">
              {language === 'gu' 
                ? `નિયમિત દર્શન સમય: સવારે ${streamStartTime || '5:00'} થી રાત્રે ${streamEndTime || '9:30'}`
                : language === 'hi'
                ? `नियमित दर्शन समय: सुबह ${streamStartTime || '5:00'} से रात ${streamEndTime || '9:30'}`
                : `Regular Darshan Schedule: ${streamStartTime || '5:00 AM'} to ${streamEndTime || '9:30 PM'}`
              }
            </p>
            {getActiveVideos().length > 0 && (
              <button 
                onClick={() => {
                  const videos = getActiveVideos();
                  if (videos.length > 0) handleSelectVideo(videos[0]);
                }}
                className="px-6 py-2.5 bg-gradient-temple text-white text-sm font-semibold rounded-full hover:scale-105 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {language === 'gu' ? 'આર્કાઇવ વિડિઓઝ જુઓ' : language === 'hi' ? 'संग्रह वीडियो देखें' : 'Browse Past Videos'}
              </button>
            )}
          </div>
        );
      }

      if (!liveUrl) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-950/85 rounded-2xl border border-gray-850">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">
              {language === 'gu' ? 'લિંક ઉપલબ્ધ નથી' : language === 'hi' ? 'लिंक उपलब्ध नहीं है' : 'Live Link Unavailable'}
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mb-4">
              {language === 'gu'
                ? 'એડમિન દ્વારા હજી સુધી આ પ્લેટફોર્મ માટે કોઈ લિંક ઉમેરવામાં આવી નથી.'
                : language === 'hi'
                ? 'एडमिन द्वारा अभी तक इस प्लेटफॉर्म के लिए कोई लिंक नहीं जोड़ा गया है।'
                : 'The live stream link has not been configured for this platform yet.'}
            </p>
          </div>
        );
      }

      if (platform === 'youtube') {
        const videoId = getYouTubeId(liveUrl);
        if (videoId) {
          return (
            <iframe
              className="w-full h-full rounded-2xl border border-gray-850 bg-black"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube Live Stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          );
        }
      }

      if (platform === 'facebook') {
        return (
          <iframe
            className="w-full h-full rounded-2xl border border-gray-850 bg-black"
            src={getFacebookEmbedUrl(liveUrl)}
            title="Facebook Live Stream"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        );
      }

      // Instagram Live Embed
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-950/80 rounded-2xl border border-gray-850">
          <Instagram className="w-16 h-16 text-pink-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {language === 'gu' ? 'ઇન્સ્ટાગ્રામ પર લાઇવ જોડાઓ' : language === 'hi' ? 'इंस्टाग्राम पर लाइव जुड़ें' : 'Join Live on Instagram'}
          </h3>
          <p className="text-sm text-gray-400 max-w-xs mb-6">
            {language === 'gu'
              ? 'ઇન્સ્ટાગ્રામ લાઇવ સીધા બ્રાઉઝરમાં પ્લે કરવું મર્યાદિત હોઈ શકે છે. લિંક પર ક્લિક કરી સીધા જોડાઈ શકો છો.'
              : language === 'hi'
              ? 'इंस्टाग्राम लाइव सीधे ब्राउज़र में चलाना सीमित हो सकता है। लिंक पर क्लिक करके सीधे जुड़ें।'
              : 'Instagram live feeds require logging in. Click below to view the broadcast directly on Instagram.'}
          </p>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold rounded-full hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            {language === 'gu' ? 'ઇન્સ્ટાગ્રામ ખોલો' : language === 'hi' ? 'इंस्टाग्राम खोलें' : 'Open Instagram Live'}
          </a>
        </div>
      );
    } else if (mode === 'archive' && selectedArchiveVideo) {
      const videoUrl = selectedArchiveVideo.url;

      // 1. Check if direct video file
      const cleanUrl = (videoUrl.split('?')[0] || '').split('#')[0].toLowerCase();
      const isDirectVideo = cleanUrl.endsWith('.mp4') || 
                            cleanUrl.endsWith('.webm') || 
                            cleanUrl.endsWith('.ogg') || 
                            cleanUrl.endsWith('.mov') || 
                            cleanUrl.endsWith('.m3u8');

      if (isDirectVideo) {
        return (
          <video
            className="w-full h-full rounded-2xl bg-black border border-gray-850"
            src={videoUrl}
            controls
            autoPlay
          />
        );
      }

      // 2. YouTube Embed Check
      const videoId = getYouTubeId(videoUrl);
      if (videoId) {
        return (
          <iframe
            className="w-full h-full rounded-2xl border border-gray-850 bg-black"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={selectedArchiveVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        );
      }

      // 3. Facebook Embed Check
      if (videoUrl.includes('facebook.com') || videoUrl.includes('fb.watch')) {
        return (
          <iframe
            className="w-full h-full rounded-2xl border border-gray-850 bg-black"
            src={getFacebookEmbedUrl(videoUrl)}
            title={selectedArchiveVideo.title}
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        );
      }

      // 4. Instagram Embed Check
      if (videoUrl.includes('instagram.com')) {
        const embedUrl = getInstagramEmbedUrl(videoUrl);
        if (embedUrl) {
          return (
            <div className="w-full h-full flex items-center justify-center bg-gray-950 rounded-2xl border border-gray-850 overflow-hidden py-4">
              <iframe
                className="w-full max-w-[340px] h-full mx-auto"
                src={embedUrl}
                title={selectedArchiveVideo.title}
                frameBorder="0"
                scrolling="no"
                allowTransparency
              />
            </div>
          );
        }
      }

      // 5. Fallback - Render directly inside iframe in play box instead of opening in other tab
      return (
        <iframe
          className="w-full h-full rounded-2xl border border-gray-850 bg-black"
          src={videoUrl.startsWith('http') ? videoUrl : `https://${videoUrl}`}
          title={selectedArchiveVideo.title}
          allowFullScreen
        />
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-6">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pt-6 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Page Title & Platform Switcher */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 border-b border-gray-800/80 pb-6">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
              <Video className="w-8 h-8 text-primary-500" />
              {language === 'gu' ? 'લાઈવ દર્શન અને પ્રસારણ' : language === 'hi' ? 'लाइव दर्शन और प्रसारण' : 'Live Darshan & Broadcast'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {language === 'gu' 
                ? 'સોશિયલ મીડિયા પરથી લાઈવ દર્શન અથવા વિડીયો ગેલેરી જુઓ'
                : language === 'hi' 
                ? 'सोशल मीडिया से लाइव दर्शन या वीडियो गैलरी देखें' 
                : 'Watch live broadcasts and archived temple videos across major platforms'}
            </p>
          </div>

          {/* Social Platform Toggle tabs */}
          <div className="flex bg-gray-900 border border-gray-800 p-1.5 rounded-2xl shadow-inner w-full md:w-auto">
            <button
              onClick={() => handleSelectPlatform('youtube')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                platform === 'youtube'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Youtube className="w-4 h-4" />
              YouTube
            </button>
            <button
              onClick={() => handleSelectPlatform('facebook')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                platform === 'facebook'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </button>
            <button
              onClick={() => handleSelectPlatform('instagram')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                platform === 'instagram'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Instagram className="w-4 h-4" />
              Instagram
            </button>
          </div>
        </div>

        {/* Theater Player Layout */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Video Player Area (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Player Container */}
            <div className="aspect-video bg-black rounded-2xl shadow-2xl relative border border-gray-800 overflow-hidden">
              {renderPlayer()}
            </div>

            {/* Video Meta Info */}
            <div className="bg-gray-900/40 border border-gray-800/60 p-6 rounded-2xl backdrop-blur-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {mode === 'live' && isLive ? (
                    <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      LIVE
                    </span>
                  ) : (
                    <span className="bg-gray-800 text-gray-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {mode === 'live' ? 'OFFLINE' : 'ARCHIVE'}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 font-mono capitalize">{platform} Stream</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1.5">
                  {mode === 'live' 
                    ? (language === 'gu' ? 'શ્રી રામ મંદિર લાઈવ દર્શન પ્રવાહ' : language === 'hi' ? 'श्री राम मंदिर लाइव दर्शन प्रवाह' : 'Shree Ram Mandir Live Darshan Broadcast')
                    : (selectedArchiveVideo?.title || 'Selected Video')
                  }
                </h2>
              </div>
              
              <button 
                onClick={() => {
                  const url = mode === 'live' ? getActiveLiveUrl() : selectedArchiveVideo?.url;
                  if (url) {
                    navigator.clipboard.writeText(url);
                    alert(language === 'gu' ? 'લિંક કોપી કરી છે!' : language === 'hi' ? 'लिंक कॉपी कर लिया है!' : 'Link copied to clipboard!');
                  }
                }}
                className="p-2.5 bg-gray-800 hover:bg-gray-750 text-gray-300 hover:text-white rounded-xl transition-all self-end sm:self-auto"
                title="Share video"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Video Playlist/Sidebar Area (Right 1 column) */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-gray-900 border border-gray-800/80 rounded-2xl shadow-xl overflow-hidden">
              
              {/* Sidebar Header / Toggle between LIVE and Past Videos */}
              <div className="p-4 bg-gray-850 border-b border-gray-800 flex items-center justify-between">
                <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary-500" />
                  Playlist Manager
                </span>
                <span className="text-xs text-gray-400 font-semibold">{getActiveVideos().length + (getActiveLiveUrl() ? 1 : 0)} Streams</span>
              </div>

              {/* Sidebar Playlist items */}
              <div className="p-2 space-y-1.5 max-h-[460px] overflow-y-auto">
                
                {/* Live Stream Item */}
                {getActiveLiveUrl() && (
                  <button
                    onClick={() => setMode('live')}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 group ${
                      mode === 'live'
                        ? 'bg-primary-500/10 border-primary-500 text-white'
                        : 'bg-transparent border-transparent text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 text-gray-400'
                    }`}>
                      <Radio className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-primary-500 group-hover:text-primary-400">Live Video</span>
                        {isLive && (
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                        )}
                      </div>
                      <p className="text-sm font-bold truncate mt-0.5">
                        {language === 'gu' ? 'લાઈવ દર્શન પ્રસારણ' : language === 'hi' ? 'लाइव दर्शन प्रसारण' : 'Live Darshan Stream'}
                      </p>
                    </div>
                  </button>
                )}

                {/* Predefined / Archive Items */}
                <div className="border-t border-gray-800/60 my-2 pt-2">
                  <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider px-3 block mb-2">
                    {language === 'gu' ? 'ભૂતકાળના વિડિઓઝ' : language === 'hi' ? 'पुराने वीडियो' : 'Video Archive'}
                  </span>
                  
                  {getActiveVideos().length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-xs">
                      {language === 'gu' ? 'કોઈ રેકોર્ડ કરેલ વિડિઓ નથી' : language === 'hi' ? 'कोई रिकॉर्ड किया गया वीडियो नहीं है' : 'No archived videos available'}
                    </div>
                  ) : (
                    getActiveVideos().map((vid, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectVideo(vid)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 group ${
                          mode === 'archive' && selectedArchiveVideo?.url === vid.url
                            ? 'bg-primary-500/10 border-primary-500 text-white'
                            : 'bg-transparent border-transparent text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-850 dark:bg-gray-800 border border-gray-800 text-primary-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Play className="w-4 h-4 fill-current" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-gray-500 font-semibold uppercase block">Archive #{idx+1}</span>
                          <p className="text-sm font-bold truncate mt-0.5">
                            {vid.title}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>

              </div>

            </div>

            {/* Timings Widget */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-850 p-6 rounded-2xl shadow-lg">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                Darshan Schedule
              </h4>
              <div className="space-y-3.5 text-sm text-gray-400">
                <div className="flex justify-between items-center border-b border-gray-800/40 pb-2">
                  <span>{language === 'gu' ? 'સવારના દર્શન' : language === 'hi' ? 'सुबह के दर्शन' : 'Morning Stream'}</span>
                  <span className="text-white font-bold font-mono">{streamStartTime || '05:00 AM'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800/40 pb-2">
                  <span>{language === 'gu' ? 'સાંજના દર્શન' : language === 'hi' ? 'शाम के दर्शन' : 'Evening Stream'}</span>
                  <span className="text-white font-bold font-mono">{streamEndTime || '09:30 PM'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{language === 'gu' ? 'આરતી સમય' : language === 'hi' ? 'आरती का समय' : 'Aarti Timings'}</span>
                  <span className="text-primary-400 font-bold">5 times daily</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
