import { useState, useEffect } from 'react';
import { Clock, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Service } from '../lib/supabase';

export function ServicesPage() {
  const { t, language, getLocalizedContent } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    purpose: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_available', true)
        .order('name_en');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([
        {
          id: '1',
          name_en: 'Rudrabhishek Puja',
          name_gu: 'રુદ્રાભિષેક પૂજા',
          name_hi: 'रुद्राभिषेक पूजा',
          description_en: 'Sacred Rudrabhishek ceremony with Vedic mantras for blessings and prosperity.',
          category: 'abhishek',
          price: 1100,
          duration_minutes: 60,
          is_available: true,
          booking_advance_days: 3,
        },
        {
          id: '2',
          name_en: 'Satyanarayan Katha',
          name_gu: 'સત્યનારાયણ કથા',
          name_hi: 'सत्यनारायण कथा',
          description_en: 'Traditional Satyanarayan Katha for family welfare and prosperity.',
          category: 'puja',
          price: 3100,
          duration_minutes: 120,
          is_available: true,
          booking_advance_days: 5,
        },
        {
          id: '3',
          name_en: 'Lakshmi Puja',
          name_gu: 'લક્ષ્મી પૂજા',
          name_hi: 'लक्ष्मी पूजा',
          description_en: 'Divine Lakshmi Puja for wealth, prosperity, and success.',
          category: 'puja',
          price: 1100,
          duration_minutes: 45,
          is_available: true,
          booking_advance_days: 3,
        },
        {
          id: '4',
          name_en: 'Ganesh Yagna',
          name_gu: 'ગણેશ યજ્ઞ',
          name_hi: 'गणेश यज्ञ',
          description_en: 'Sacred Ganesh Yagna for removing obstacles and new beginnings.',
          category: 'yagna',
          price: 5100,
          duration_minutes: 180,
          is_available: true,
          booking_advance_days: 7,
        },
        {
          id: '5',
          name_en: 'Maha Mrityunjaya Puja',
          name_gu: 'મહા મૃત્યુંજય પૂજા',
          name_hi: 'महा मृत्युंजय पूजा',
          description_en: 'Powerful Maha Mrityunjaya Puja for health and longevity.',
          category: 'puja',
          price: 2100,
          duration_minutes: 90,
          is_available: true,
          booking_advance_days: 5,
        },
        {
          id: '6',
          name_en: 'Community Hall Booking',
          name_gu: 'કમ્યુનિટી હોલ',
          name_hi: 'कम्युनिटी हॉल',
          description_en: 'Spacious community hall for weddings, religious ceremonies, and events.',
          category: 'hall',
          price: 15000,
          duration_minutes: 480,
          is_available: true,
          booking_advance_days: 30,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('service_bookings').insert({
        service_id: selectedService.id,
        booking_date: bookingData.date,
        devotee_name: bookingData.name,
        devotee_phone: bookingData.phone,
        devotee_email: bookingData.email || null,
        purpose: bookingData.purpose || null,
        amount: selectedService.price,
        status: 'pending',
      });

      if (error) throw error;
      setShowBookingForm(false);
      setSelectedService(null);
      setBookingData({ date: '', time: '', name: '', phone: '', email: '', purpose: '' });
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { gu: string; hi: string; en: string }> = {
      puja: { gu: 'પૂજા', hi: 'पूजा', en: 'Puja' },
      yagna: { gu: 'યજ્ઞ', hi: 'यज्ञ', en: 'Yagna' },
      abhishek: { gu: 'અભિષેક', hi: 'अभिषेक', en: 'Abhishek' },
      hall: { gu: 'હોલ', hi: 'हॉल', en: 'Hall' },
    };
    return labels[category]?.[language as 'gu' | 'hi' | 'en'] || category;
  };

  return (
    <div className="min-h-screen bg-temple-bg dark:bg-gray-900 pt-6 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-temple-text dark:text-white mb-4">
              {t('services')}
            </h1>
            <p className="text-temple-muted dark:text-gray-400 text-lg">
              {language === 'gu' ? 'પૂજા, અભિષેક અને અન્ય સેવાઓ' : language === 'hi' ? 'पूजा, अभिषेक और अन्य सेवाएं' : 'Puja, Abhishek and other religious services'}
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-temple hover:shadow-temple-lg transition-shadow group"
                >
                  <div className="h-40 bg-gradient-temple relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl opacity-20">
                        {service.category === 'puja' ? '🙏' : service.category === 'yagna' ? '🔥' : service.category === 'abhishek' ? '💧' : '🏛️'}
                      </span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
                        {getCategoryLabel(service.category)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-lg text-temple-text dark:text-white mb-2">
                      {getLocalizedContent({ en: service.name_en, gu: service.name_gu, hi: service.name_hi })}
                    </h3>
                    <p className="text-sm text-temple-muted dark:text-gray-400 mb-4 line-clamp-2">
                      {getLocalizedContent({ en: service.description_en, gu: service.description_gu, hi: service.description_hi })}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-temple-muted dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {service.duration_minutes} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {service.booking_advance_days} {language === 'gu' ? 'દિવસ' : language === 'hi' ? 'दिन' : 'days'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ₹{service.price.toLocaleString('en-IN')}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setShowBookingForm(true);
                        }}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                      >
                        {t('book_now')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingForm && selectedService && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="font-semibold text-xl text-temple-text dark:text-white mb-2">
                {getLocalizedContent({ en: selectedService.name_en, gu: selectedService.name_gu, hi: selectedService.name_hi })}
              </h3>
              <p className="text-sm text-temple-muted dark:text-gray-400 mb-6">
                {language === 'gu' ? 'બુકિંગ વિગતો ભરો' : language === 'hi' ? 'बुकिंग विवरण भरें' : 'Fill booking details'}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-temple-text dark:text-white mb-2">
                    {language === 'gu' ? 'તારીખ *' : language === 'hi' ? 'तारीख *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    min={new Date(Date.now() + selectedService.booking_advance_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-temple-border dark:border-gray-600 bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-temple-text dark:text-white mb-2">
                    {language === 'gu' ? 'નામ *' : language === 'hi' ? 'नाम *' : 'Name *'}
                  </label>
                  <input
                    type="text"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-temple-border dark:border-gray-600 bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-temple-text dark:text-white mb-2">
                    {language === 'gu' ? 'ફોન *' : language === 'hi' ? 'फोन *' : 'Phone *'}
                  </label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-temple-border dark:border-gray-600 bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-temple-text dark:text-white mb-2">
                    {language === 'gu' ? 'ઇમેઇલ' : language === 'hi' ? 'ईमेल' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-temple-border dark:border-gray-600 bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-temple-text dark:text-white mb-2">
                    {language === 'gu' ? 'હેતુ/સંદેશ' : language === 'hi' ? 'उद्देश्य/संदेश' : 'Purpose/Message'}
                  </label>
                  <textarea
                    value={bookingData.purpose}
                    onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-temple-border dark:border-gray-600 bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-temple-text dark:text-white">
                <span className="text-sm">{language === 'gu' ? 'કુલ રકમ:' : language === 'hi' ? 'कुल राशि:' : 'Total Amount:'}</span>
                <span className="text-xl font-bold">₹{selectedService.price.toLocaleString('en-IN')}</span>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedService(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-temple-border dark:border-gray-600 text-temple-text dark:text-white font-medium hover:bg-temple-bg dark:hover:bg-gray-700 transition-colors"
                >
                  {language === 'gu' ? 'રદ કરો' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  onClick={handleBooking}
                  disabled={isSubmitting || !bookingData.date || !bookingData.name || !bookingData.phone}
                  className="flex-1 py-3 rounded-xl bg-gradient-temple text-white font-semibold hover:shadow-temple transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    language === 'gu' ? 'બુક કરો' : language === 'hi' ? 'बुक करें' : 'Book Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
