import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Filter,
  Search,
  ChevronRight,
  Users,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Event } from '../lib/supabase';

export function EventsPage() {
  const { t, language, getLocalizedContent } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', label: language === 'gu' ? 'બધા' : language === 'hi' ? 'सभी' : 'All' },
    { id: 'religious', label: language === 'gu' ? 'ધાર્મિક' : language === 'hi' ? 'धार्मिक' : 'Religious' },
    { id: 'festival', label: language === 'gu' ? 'તહેવાર' : language === 'hi' ? 'त्योहार' : 'Festival' },
    { id: 'yatra', label: language === 'gu' ? 'યાત્રા' : language === 'hi' ? 'यात्रा' : 'Yatra' },
    { id: 'bhajan', label: language === 'gu' ? 'ભજન' : language === 'hi' ? 'भजन' : 'Bhajan' },
    { id: 'puja', label: language === 'gu' ? 'પૂજા' : language === 'hi' ? 'पूजा' : 'Puja' },
    { id: 'community', label: language === 'gu' ? 'સમુદાય' : language === 'hi' ? 'समुदाय' : 'Community' },
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedCategory]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      // Set mock events if loading fails
      setEvents([
        {
          id: '1',
          title_en: 'Ram Navami Festival',
          title_gu: 'રામ નવમી તહેવાર',
          title_hi: 'राम नवमी त्योहार',
          description_en: 'Celebrate the birth of Lord Ram with special pujas and bhajans.',
          category: 'festival',
          event_date: '2025-03-28',
          start_time: '06:00',
          venue: 'Main Temple Hall',
          image_url: 'https://images.pexels.com/photos/2387871/pexels-photo-2387871.jpeg?auto=compress&cs=tinysrgb&w=800',
          registration_required: false,
          current_registrations: 0,
          donation_collected: 0,
          is_featured: true,
          status: 'upcoming',
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          title_en: 'Hanuman Jayanti',
          title_gu: 'હનુમાન જયંતી',
          title_hi: 'हनुमान जयंती',
          description_en: 'Celebrate the birth of Lord Hanuman with special abhishek and bhajans.',
          category: 'festival',
          event_date: '2025-04-12',
          start_time: '05:00',
          venue: 'Hanuman Mandir',
          image_url: 'https://images.pexels.com/photos/5458388/pexels-photo-5458388.jpeg?auto=compress&cs=tinysrgb&w=800',
          registration_required: true,
          current_registrations: 150,
          max_attendees: 500,
          donation_collected: 0,
          is_featured: true,
          status: 'upcoming',
          created_at: '',
          updated_at: '',
        },
        {
          id: '3',
          title_en: 'Weekly Bhajan Sandhya',
          title_gu: 'સાપ્તાહિક ભજન સંધ્યા',
          title_hi: 'साप्ताहिक भजन संध्या',
          description_en: 'Join us for evening bhajans and devotional singing.',
          category: 'bhajan',
          event_date: '2025-03-15',
          start_time: '18:00',
          venue: 'Community Hall',
          image_url: 'https://images.pexels.com/photos/761425/pexels-photo-761425.jpeg?auto=compress&cs=tinysrgb&w=800',
          registration_required: true,
          current_registrations: 75,
          max_attendees: 200,
          donation_collected: 0,
          is_featured: true,
          status: 'upcoming',
          created_at: '',
          updated_at: '',
        },
        {
          id: '4',
          title_en: 'Rudrabhishek Puja',
          title_gu: 'રુદ્રાભિષેક પૂજા',
          title_hi: 'रुद्राभिषेक पूजा',
          description_en: 'Special Rudrabhishek ceremony for blessings and prosperity.',
          category: 'puja',
          event_date: '2025-03-20',
          start_time: '09:00',
          venue: 'Main Temple',
          image_url: 'https://images.pexels.com/photos/2387871/pexels-photo-2387871.jpeg?auto=compress&cs=tinysrgb&w=800',
          registration_required: true,
          current_registrations: 30,
          max_attendees: 50,
          donation_collected: 0,
          is_featured: false,
          status: 'upcoming',
          created_at: '',
          updated_at: '',
        },
        {
          id: '5',
          title_en: 'Annual Yatra to Ayodhya',
          title_gu: 'અયોધ્યા વાર્ષિક યાત્રા',
          title_hi: 'अयोध्या वार्षिक यात्रा',
          description_en: 'Join our annual pilgrimage to the holy city of Ayodhya.',
          category: 'yatra',
          event_date: '2025-04-20',
          start_time: '05:00',
          venue: 'Ayodhya',
          image_url: 'https://images.pexels.com/photos/761425/pexels-photo-761425.jpeg?auto=compress&cs=tinysrgb&w=800',
          registration_required: true,
          current_registrations: 80,
          max_attendees: 150,
          donation_target: 500000,
          donation_collected: 250000,
          is_featured: true,
          status: 'upcoming',
          created_at: '',
          updated_at: '',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title_en.toLowerCase().includes(query) ||
          e.title_gu.includes(query) ||
          e.title_hi.includes(query) ||
          e.venue?.toLowerCase().includes(query)
      );
    }
    setFilteredEvents(filtered);
  };

  return (
    <div className="min-h-screen bg-temple-bg dark:bg-gray-900 pt-6">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-temple-text dark:text-white mb-4">
              {t('events')}
            </h1>
            <p className="text-temple-muted dark:text-gray-400 text-lg">
              {language === 'gu'
                ? 'આગામી તહેવારો અને કાર્યક્રમો જુઓ અને નોંધણી કરો'
                : language === 'hi'
                ? 'आगामी त्योहार और कार्यक्रम देखें और पंजीकरण करें'
                : 'View and register for upcoming festivals and events'}
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-temple-border dark:border-gray-700 sticky top-20 z-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-temple-muted dark:text-gray-400" />
              <input
                type="text"
                placeholder={language === 'gu' ? 'કાર્યક્રમ શોધો...' : language === 'hi' ? 'कार्यक्रम खोजें...' : 'Search events...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-temple-border dark:border-gray-600 bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-5 h-5 text-temple-muted dark:text-gray-400" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-temple-muted dark:text-gray-400">{t('loading')}</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-temple-muted dark:text-gray-400 mb-4" />
              <p className="text-temple-muted dark:text-gray-400">
                {language === 'gu' ? 'કોઈ કાર્યક્રમ મળ્યા નથી' : language === 'hi' ? 'कोई कार्यक्रम नहीं मिले' : 'No events found'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  language={language}
                  getLocalizedContent={getLocalizedContent}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EventCard({
  event,
  language,
  getLocalizedContent,
}: {
  event: Event;
  language: string;
  getLocalizedContent: (obj: { en?: string; gu?: string; hi?: string }) => string;
}) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      religious: 'bg-blue-500',
      festival: 'bg-festival-500',
      yatra: 'bg-green-500',
      bhajan: 'bg-purple-500',
      puja: 'bg-orange-500',
      community: 'bg-teal-500',
    };
    return colors[category] || 'bg-primary-500';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { gu: string; hi: string; en: string }> = {
      religious: { gu: 'ધાર્મિક', hi: 'धार्मिक', en: 'Religious' },
      festival: { gu: 'તહેવાર', hi: 'त्योहार', en: 'Festival' },
      yatra: { gu: 'યાત્રા', hi: 'यात्रा', en: 'Yatra' },
      bhajan: { gu: 'ભજન', hi: 'भजन', en: 'Bhajan' },
      puja: { gu: 'પૂજા', hi: 'पूजा', en: 'Puja' },
      community: { gu: 'સમુદાય', hi: 'समुदाय', en: 'Community' },
    };
    return labels[category]?.[language as 'gu' | 'hi' | 'en'] || category;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-temple hover:shadow-temple-lg transition-shadow group">
      <div className="relative h-56">
        <img
          src={event.image_url || 'https://images.pexels.com/photos/2387871/pexels-photo-2387871.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={getLocalizedContent({ en: event.title_en, gu: event.title_gu, hi: event.title_hi })}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 ${getCategoryColor(event.category)} text-white text-xs font-semibold rounded-full`}>
            {getCategoryLabel(event.category)}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
            {getLocalizedContent({ en: event.title_en, gu: event.title_gu, hi: event.title_hi })}
          </h3>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3 text-sm text-temple-muted dark:text-gray-400">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span>{formatDate(event.event_date)}</span>
          </div>
          {event.start_time && (
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>{event.start_time} {event.end_time && `- ${event.end_time}`}</span>
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary-500" />
              <span>{event.venue}</span>
            </div>
          )}
        </div>

        {event.description_en && (
          <p className="mt-3 text-sm text-temple-muted dark:text-gray-400 line-clamp-2">
            {getLocalizedContent({ en: event.description_en, gu: event.description_gu, hi: event.description_hi })}
          </p>
        )}

        {event.registration_required && event.max_attendees && (
          <div className="mt-4 pt-4 border-t border-temple-border dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary-500" />
                <span className="text-temple-muted dark:text-gray-400">
                  {language === 'gu' ? 'નોંધણીઓ:' : language === 'hi' ? 'पंजीकरण:' : 'Registrations:'}
                </span>
              </div>
              <span className="font-semibold text-temple-text dark:text-white">
                {event.current_registrations}/{event.max_attendees}
              </span>
            </div>
            <div className="h-2 bg-temple-border dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-temple"
                style={{ width: `${(event.current_registrations / event.max_attendees) * 100}%` }}
              />
            </div>
          </div>
        )}

        <Link
          to={`/events/${event.id}`}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
        >
          {language === 'gu' ? 'વિગતો જુઓ' : language === 'hi' ? 'विवरण देखें' : 'View Details'}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
