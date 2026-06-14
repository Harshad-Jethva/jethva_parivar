import { useState, useEffect } from 'react';
import { supabase, Event } from '../../lib/supabase';
import { Plus, Edit3, Trash2, Calendar, Save, X } from 'lucide-react';

export function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Form values
  const [titleEn, setTitleEn] = useState('');
  const [titleGu, setTitleGu] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descGu, setDescGu] = useState('');
  const [descHi, setDescHi] = useState('');
  const [category, setCategory] = useState('religious');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [regRequired, setRegRequired] = useState(false);
  const [maxAttendees, setMaxAttendees] = useState(100);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState('upcoming');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: false });
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  const openAddModal = () => {
    setSelectedEvent(null);
    setTitleEn('');
    setTitleGu('');
    setTitleHi('');
    setDescEn('');
    setDescGu('');
    setDescHi('');
    setCategory('religious');
    setDate('');
    setStartTime('');
    setEndTime('');
    setVenue('');
    setImageUrl('');
    setRegRequired(false);
    setMaxAttendees(100);
    setFeatured(false);
    setStatus('upcoming');
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setSelectedEvent(event);
    setTitleEn(event.title_en);
    setTitleGu(event.title_gu);
    setTitleHi(event.title_hi);
    setDescEn(event.description_en || '');
    setDescGu(event.description_gu || '');
    setDescHi(event.description_hi || '');
    setCategory(event.category);
    setDate(event.event_date);
    setStartTime(event.start_time || '');
    setEndTime(event.end_time || '');
    setVenue(event.venue || '');
    setImageUrl(event.image_url || '');
    setRegRequired(event.registration_required);
    setMaxAttendees(event.max_attendees || 100);
    setFeatured(event.is_featured);
    setStatus(event.status);
    setIsModalOpen(true);
  };

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventPayload = {
      title_en: titleEn,
      title_gu: titleGu,
      title_hi: titleHi,
      description_en: descEn,
      description_gu: descGu,
      description_hi: descHi,
      category,
      event_date: date,
      start_time: startTime || null,
      end_time: endTime || null,
      venue,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?auto=compress&cs=tinysrgb&w=800',
      registration_required: regRequired,
      max_attendees: regRequired ? Number(maxAttendees) : null,
      is_featured: featured,
      status
    };

    try {
      if (selectedEvent) {
        // Update
        const { error } = await supabase.from('events').update(eventPayload, selectedEvent.id);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Event updated successfully.' });
      } else {
        // Create
        const { error } = await supabase.from('events').insert(eventPayload);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Event created successfully.' });
      }
      setIsModalOpen(false);
      loadEvents();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving event.' });
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const { error } = await supabase.from('events').delete(id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Event deleted successfully.' });
      loadEvents();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error deleting event.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Temple Events Directory</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage all religious festivals, yatras, community programs and bhajans.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold shadow transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Events List Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-150 dark:border-gray-700">
                <th className="px-6 py-4">Event Info</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Registrations</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={e.image_url} alt={e.title_en} className="w-12 h-12 object-cover rounded-lg border dark:border-gray-700" />
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-white block">{e.title_en}</span>
                        <span className="text-xs text-gray-400 block">{e.title_gu}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs uppercase font-medium">{e.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-primary-500" />
                      <span>{new Date(e.event_date).toLocaleDateString()} {e.start_time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {e.registration_required ? (
                      <span className="text-xs text-primary-600 font-semibold">{e.current_registrations} / {e.max_attendees} slots</span>
                    ) : (
                      <span className="text-xs text-gray-400">Not Required</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      e.status === 'upcoming' ? 'bg-blue-50 text-blue-700' :
                      e.status === 'ongoing' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(e)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors inline-flex"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEvent(e.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors inline-flex"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-white">{selectedEvent ? 'Edit Event' : 'Add New Event'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveEvent} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Titles Language-wise */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Title (English)</label>
                  <input type="text" required value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Title (Gujarati)</label>
                  <input type="text" required value={titleGu} onChange={(e) => setTitleGu(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Title (Hindi)</label>
                  <input type="text" required value={titleHi} onChange={(e) => setTitleHi(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm" />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Description (English)</label>
                  <textarea rows={2} value={descEn} onChange={(e) => setDescEn(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Description (Gujarati)</label>
                  <textarea rows={2} value={descGu} onChange={(e) => setDescGu(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Description (Hindi)</label>
                  <textarea rows={2} value={descHi} onChange={(e) => setDescHi(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm">
                    <option value="religious">Religious</option>
                    <option value="festival">Festival</option>
                    <option value="yatra">Yatra</option>
                    <option value="bhajan">Bhajan</option>
                    <option value="puja">Puja</option>
                    <option value="community">Community</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Event Date</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm text-gray-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm">
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Start Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm text-gray-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">End Time</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm text-gray-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Venue Location</label>
                  <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Image Banner URL</label>
                  <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm font-mono" />
                </div>
                <div className="flex items-center gap-6 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={regRequired} onChange={() => setRegRequired(!regRequired)} className="text-primary-500 rounded" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Registration Required</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={featured} onChange={() => setFeatured(!featured)} className="text-primary-500 rounded" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Featured Event</span>
                  </label>
                </div>
              </div>

              {regRequired && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Max Registration Limit (Slots)</label>
                  <input type="number" value={maxAttendees} onChange={(e) => setMaxAttendees(Number(e.target.value))} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm w-48" />
                </div>
              )}

              <div className="flex justify-end gap-2 border-t dark:border-gray-700 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium shadow"><Save className="w-4 h-4" />Save Event</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
