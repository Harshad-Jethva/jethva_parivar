import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Send, Bell, MessageSquare, AlertCircle, Calendar } from 'lucide-react';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('push');
  const [targetRole, setTargetRole] = useState('all');
  const [scheduleTime, setScheduleTime] = useState('');
  
  const [isSending, setIsSending] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
      setNotifications(data || []);
    } catch (err) {
      console.error('Error loading notices:', err);
    }
  };

  const triggerNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setIsSending(true);

    try {
      const payload = {
        title_en: title,
        title_gu: title,
        title_hi: title,
        message_en: message,
        message_gu: message,
        message_hi: message,
        type: channel,
        is_read: false
      };

      const { error } = await supabase.from('notifications').insert(payload);
      if (error) throw error;

      setAlertMsg({ type: 'success', text: `Notification broadcasted successfully via ${channel.toUpperCase()}!` });
      setTitle('');
      setMessage('');
      setScheduleTime('');
      loadNotifications();
      setTimeout(() => setAlertMsg(null), 3000);
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Push & Messaging Notification Center</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Broadcast instant updates, festival announcements and emergency alerts to devotees.</p>
        </div>
      </div>

      {alertMsg && (
        <div className={`p-4 rounded-lg text-sm font-medium ${alertMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {alertMsg.text}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Broadcast Form */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            <Send className="w-5 h-5 text-primary-500" />
            Trigger Broadcast Dispatch
          </h3>

          <form onSubmit={triggerNotification} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ram Navami Darshan Starting"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-950 rounded-lg text-xs"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Target Recipients Group</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-950 rounded-lg text-xs text-gray-600"
                >
                  <option value="all">All Devotees & Guests</option>
                  <option value="member">Registered Members Only</option>
                  <option value="volunteer">Active Volunteers Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { val: 'push', label: 'Push Alert', icon: Bell },
                { val: 'sms', label: 'SMS Carrier', icon: AlertCircle },
                { val: 'whatsapp', label: 'WhatsApp', icon: MessageSquare }
              ].map(({ val, label, icon: Icon }) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setChannel(val)}
                  className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${
                    channel === val 
                      ? 'bg-primary-50 border-primary-400 text-primary-600' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Message Detail Content</label>
              <textarea
                required
                rows={3}
                placeholder="Write message details..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-950 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Schedule Release Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-950 rounded-lg text-xs text-gray-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSending}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white rounded-lg text-xs font-bold shadow"
              >
                <Send className="w-4 h-4" /> {isSending ? 'Sending Alerts...' : 'Broadcast Notice Now'}
              </button>
            </div>

          </form>
        </div>

        {/* Transmission Logs */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[500px]">
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-3">Transmission History Logs</h3>
          
          <div className="flex-1 overflow-y-auto space-y-2 text-xs">
            {notifications.map((n, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-center text-[9px] text-gray-400 mb-1">
                  <span className="uppercase font-bold text-primary-500">{n.type} broadcast</span>
                  <span>{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <span className="font-bold text-gray-800 dark:text-white block">{n.title_en}</span>
                <p className="text-gray-500 mt-1 line-clamp-2">{n.message_en}</p>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center text-gray-400 py-24">
                No notification transmission logs.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
