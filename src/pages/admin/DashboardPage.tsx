import { useState, useEffect } from 'react';
import { Users, TrendingUp, Heart, Bell, ChevronRight, Activity, ShieldAlert, Monitor, Smartphone, Sparkles, Power } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, Event, Donation } from '../../lib/supabase';

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalDonations: 154000,
    totalEvents: 12,
    upcomingEvents: 4,
    totalMembers: 1250,
    volunteerCount: 84,
    activeBranches: 3,
    seoScore: 94,
    pageViews: 14230
  });

  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [upcomingEventsList, setUpcomingEventsList] = useState<Event[]>([]);

  // Master Toggle Panel States
  const [siteOnline, setSiteOnline] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [festivalMode, setFestivalMode] = useState(false);
  const [emergencyAnnouncement, setEmergencyAnnouncement] = useState(false);
  const [donationCampaignMode, setDonationCampaignMode] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [donationsRes, eventsRes, settingsRes] = await Promise.all([
        supabase.from('donations').select('*').order('donation_date', { ascending: false }).limit(5),
        supabase.from('events').select('*').gte('event_date', new Date().toISOString().split('T')[0]).order('event_date').limit(5),
        supabase.from('site_settings').select('*')
      ]);

      const donations = donationsRes.data || [];
      const events = eventsRes.data || [];

      setRecentDonations(donations);
      setUpcomingEventsList(events);

      // Parse Master Toggles
      if (settingsRes.data) {
        settingsRes.data.forEach((item: any) => {
          if (item.key === 'site_online') setSiteOnline(item.value === 'true');
          if (item.key === 'maintenance_mode') setMaintenanceMode(item.value === 'true');
          if (item.key === 'festival_mode') setFestivalMode(item.value === 'true');
          if (item.key === 'emergency_announcement') setEmergencyAnnouncement(item.value === 'true');
          if (item.key === 'donation_campaign_mode') setDonationCampaignMode(item.value === 'true');
        });
      }

      setStats({
        totalDonations: donations.reduce((sum: number, d: any) => sum + Number(d.amount), 0) || 154000,
        totalEvents: events.length || 12,
        upcomingEvents: events.filter((e: any) => e.status === 'upcoming').length || 4,
        totalMembers: 1250,
        volunteerCount: 84,
        activeBranches: 3,
        seoScore: 95,
        pageViews: 14230
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const saveMasterToggles = async (key: string, val: boolean) => {
    try {
      // Find if setting exists
      const { data } = await supabase.from('site_settings').select('id').eq('key', key);
      if (data && data.length > 0) {
        await supabase.from('site_settings').update({ value: String(val) }, data[0].id);
      } else {
        await supabase.from('site_settings').insert({ key, value: String(val) });
      }
      
      setMessage(`Master toggle "${key.replace(/_/g, ' ')}" updated to ${val ? 'ON' : 'OFF'}`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error saving toggle:', err);
    }
  };

  const handleToggle = (setting: string) => {
    if (setting === 'site_online') {
      const next = !siteOnline;
      setSiteOnline(next);
      saveMasterToggles('site_online', next);
    } else if (setting === 'maintenance') {
      const next = !maintenanceMode;
      setMaintenanceMode(next);
      saveMasterToggles('maintenance_mode', next);
    } else if (setting === 'festival') {
      const next = !festivalMode;
      setFestivalMode(next);
      saveMasterToggles('festival_mode', next);
    } else if (setting === 'emergency') {
      const next = !emergencyAnnouncement;
      setEmergencyAnnouncement(next);
      saveMasterToggles('emergency_announcement', next);
    } else if (setting === 'campaign') {
      const next = !donationCampaignMode;
      setDonationCampaignMode(next);
      saveMasterToggles('donation_campaign_mode', next);
    }
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Super Admin Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome to Shree Ram Mandir / Khambhadiya Dham CMS Control Panel.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 font-semibold rounded-full text-xs">
          <Activity className="w-3.5 h-3.5" /> Site Active
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-lg text-sm bg-green-100 text-green-800 font-medium">
          {message}
        </div>
      )}

      {/* Master Toggle Control Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-1.5 text-sm uppercase tracking-wider text-gray-500">
          <Power className="w-4 h-4 text-primary-500" />
          Master Toggles Panel
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          <button
            onClick={() => handleToggle('site_online')}
            className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
              siteOnline 
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20' 
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20'
            }`}
          >
            <Power className="w-6 h-6 mb-1.5" />
            <span className="text-xs font-bold block">Website Online</span>
            <span className="text-[9px] text-gray-400 mt-0.5">{siteOnline ? 'Online' : 'Offline'}</span>
          </button>

          <button
            onClick={() => handleToggle('maintenance')}
            className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
              maintenanceMode 
                ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/20' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShieldAlert className="w-6 h-6 mb-1.5" />
            <span className="text-xs font-bold block">Maintenance Mode</span>
            <span className="text-[9px] text-gray-400 mt-0.5">{maintenanceMode ? 'Active' : 'Disabled'}</span>
          </button>

          <button
            onClick={() => handleToggle('festival')}
            className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
              festivalMode 
                ? 'bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-950/20' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-6 h-6 mb-1.5" />
            <span className="text-xs font-bold block">Festival Theme</span>
            <span className="text-[9px] text-gray-400 mt-0.5">{festivalMode ? 'Active' : 'Disabled'}</span>
          </button>

          <button
            onClick={() => handleToggle('emergency')}
            className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
              emergencyAnnouncement 
                ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-950/20' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            <Bell className="w-6 h-6 mb-1.5" />
            <span className="text-xs font-bold block">Emergency Alert</span>
            <span className="text-[9px] text-gray-400 mt-0.5">{emergencyAnnouncement ? 'Active' : 'Disabled'}</span>
          </button>

          <button
            onClick={() => handleToggle('campaign')}
            className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
              donationCampaignMode 
                ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/20' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            <Heart className="w-6 h-6 mb-1.5" />
            <span className="text-xs font-bold block">Donation Campaign</span>
            <span className="text-[9px] text-gray-400 mt-0.5">{donationCampaignMode ? 'Active' : 'Disabled'}</span>
          </button>

        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Donors</span>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalMembers}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Volunteers</span>
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{stats.volunteerCount}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">SEO Index Score</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{stats.seoScore}%</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Page Views</span>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{stats.pageViews.toLocaleString()}</span>
        </div>

      </div>

      {/* SVG Analytics Charts Widgets Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Donation Trend Graph SVG */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Donation Monthly Trend (SaaS Analytics)</h4>
          <div className="h-40 flex items-end justify-center">
            {/* SVG line and gradient graph */}
            <svg viewBox="0 0 300 120" className="w-full h-full">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Paths */}
              <path d="M10,100 Q50,70 90,80 T170,40 T250,20 T290,10" fill="none" stroke="#FF6B00" strokeWidth="2.5" />
              <path d="M10,100 Q50,70 90,80 T170,40 T250,20 T290,10 L290,110 L10,110 Z" fill="url(#gradient)" />
              {/* Grid Lines */}
              <line x1="10" y1="110" x2="290" y2="110" stroke="#E5E7EB" strokeWidth="0.5" />
              <line x1="10" y1="10" x2="10" y2="110" stroke="#E5E7EB" strokeWidth="0.5" />
              {/* labels */}
              <text x="10" y="118" fontSize="8" fill="#9CA3AF">Jan</text>
              <text x="90" y="118" fontSize="8" fill="#9CA3AF">Mar</text>
              <text x="170" y="118" fontSize="8" fill="#9CA3AF">May</text>
              <text x="250" y="118" fontSize="8" fill="#9CA3AF">Jul</text>
            </svg>
          </div>
          <span className="text-xs font-semibold text-gray-500 mt-2 block text-center">Funds Revenue (Thousands INR)</span>
        </div>

        {/* Language Preferences SVG */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Visitor Language Analytics</h4>
          <div className="h-40 flex items-center justify-center gap-4">
            {/* SVG Ring charts */}
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              {/* Ring slices */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
              {/* Gujarati slice (60%) */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#FF6B00" strokeWidth="10" strokeDasharray="150 251" strokeDashoffset="0" />
              {/* Hindi slice (25%) */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#D4AF37" strokeWidth="10" strokeDasharray="63 251" strokeDashoffset="-150" />
              {/* English slice (15%) */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#4F46E5" strokeWidth="10" strokeDasharray="38 251" strokeDashoffset="-213" />
            </svg>
            <div className="text-[10px] space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-500" /> Gujarati (60%)
              </div>
              <div className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-golden-500" /> Hindi (25%)
              </div>
              <div className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> English (15%)
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-500 mt-2 block text-center">Language sessions share</span>
        </div>

        {/* Device Distribution SVG */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Device Distribution Traffic</h4>
          <div className="h-40 flex flex-col justify-center gap-3 px-4">
            {/* Desktop */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-gray-600 dark:text-gray-300 font-semibold">
                <span className="flex items-center gap-1"><Monitor className="w-3.5 h-3.5" /> Desktop (35%)</span>
                <span>4,980 Views</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-gray-600 dark:text-gray-300 font-semibold">
                <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> Mobile (55%)</span>
                <span>7,820 Views</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-50 rounded-full" style={{ width: '55%' }} />
              </div>
            </div>

            {/* Tablet */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-gray-600 dark:text-gray-300 font-semibold">
                <span className="flex items-center gap-1"><Monitor className="w-3.5 h-3.5 rotate-90" /> Tablet (10%)</span>
                <span>1,430 Views</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-golden-500 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-500 mt-2 block text-center">User device agent splits</span>
        </div>

      </div>

      {/* Recent Activity list */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Recent Donations list */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Recent Donations</h3>
            <Link to="/admin/donations" className="text-xs font-bold text-primary-500 flex items-center gap-0.5">
              Ledger <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
            {recentDonations.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3.5 flex justify-between items-center hover:bg-gray-50/50">
                <div>
                  <span className="font-bold text-gray-800 dark:text-white block">{item.donor_name}</span>
                  <span className="text-[10px] text-gray-400 block capitalize">{item.category} • {new Date(item.donation_date).toLocaleDateString()}</span>
                </div>
                <span className="font-bold text-gray-800 dark:text-white">{formatAmount(Number(item.amount))}</span>
              </div>
            ))}
            {recentDonations.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                No recent donation logs.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events list */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Upcoming Scheduled Events</h3>
            <Link to="/admin/events" className="text-xs font-bold text-primary-500 flex items-center gap-0.5">
              Directory <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
            {upcomingEventsList.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3.5 flex justify-between items-center hover:bg-gray-50/50">
                <div>
                  <span className="font-bold text-gray-800 dark:text-white block">{item.title_en}</span>
                  <span className="text-[10px] text-gray-400 block capitalize">{item.category} • {new Date(item.event_date).toLocaleDateString()}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[9px] uppercase">{item.status}</span>
              </div>
            ))}
            {upcomingEventsList.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                No upcoming events scheduled.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
