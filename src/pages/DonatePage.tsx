import { useState } from 'react';
import {
  Heart,
  Gift,
  CreditCard,
  Smartphone,
  Building2,
  Check,
  AlertCircle,
  Sparkles,
  Shield,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const predefinedAmounts = [101, 501, 1001, 5001, 10001, 25001];

const donationCategories = [
  { id: 'general', icon: Sparkles, color: 'from-orange-500 to-amber-500' },
  { id: 'annadan', icon: Gift, color: 'from-green-500 to-emerald-500' },
  { id: 'gaushala', icon: Heart, color: 'from-amber-500 to-yellow-500' },
  { id: 'festival', icon: Sparkles, color: 'from-red-500 to-pink-500' },
  { id: 'development', icon: Building2, color: 'from-blue-500 to-cyan-500' },
  { id: 'education', icon: Gift, color: 'from-purple-500 to-violet-500' },
];

export function DonatePage() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pan: '',
    isAnonymous: false,
  });
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getCategoryLabel = (id: string) => {
    const labels: Record<string, { gu: string; hi: string; en: string }> = {
      general: { gu: 'સામાન્ય દાન', hi: 'सामान्य दान', en: 'General Donation' },
      annadan: { gu: 'અન્નદાન', hi: 'अन्नदान', en: 'Annadan' },
      gaushala: { gu: 'ગૌશાલા દાન', hi: 'गौशाला दान', en: 'Gaushala Donation' },
      festival: { gu: 'તહેવાર દાન', hi: 'त्योहार दान', en: 'Festival Donation' },
      development: { gu: 'મંદિર વિકાસ', hi: 'मंदिर विकास', en: 'Temple Development' },
      education: { gu: 'શિક્ષણ દાન', hi: 'शिक्षण दान', en: 'Education Donation' },
    };
    return labels[id]?.[language as 'gu' | 'hi' | 'en'] || id;
  };

  const getCategoryDescription = (id: string) => {
    const descriptions: Record<string, { gu: string; hi: string; en: string }> = {
      general: { gu: 'મંદિરની દૈનિક પ્રવૃત્તિઓ માટે', hi: 'मंदिर की दैनिक गतिविधियों के लिए', en: 'For daily temple activities' },
      annadan: { gu: 'ભોજન દાન યોજના માટે', hi: 'भोजन दान योजना के लिए', en: 'For food donation program' },
      gaushala: { gu: 'ગાય સંભાળ માટે', hi: 'गाय संभाल के लिए', en: 'For cow care' },
      festival: { gu: 'તહેવાર ઉજવણી માટે', hi: 'त्योहार उत्सव के लिए', en: 'For festival celebrations' },
      development: { gu: 'મંદિર નિર્માણ માટે', hi: 'मंदिर निर्माण के लिए', en: 'For temple construction' },
      education: { gu: 'શૈક્ષણિક કાર્યક્રમો માટે', hi: 'शैक्षिक कार्यक्रमों के लिए', en: 'For educational programs' },
    };
    return descriptions[id]?.[language as 'gu' | 'hi' | 'en'] || '';
  };

  const getAmount = () => selectedAmount || parseInt(customAmount) || 0;

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!donorInfo.name.trim()) {
      newErrors.name = language === 'gu' ? 'નામ આવશ્યક છે' : language === 'hi' ? 'नाम आवश्यक है' : 'Name is required';
    }
    if (!donorInfo.phone.trim()) {
      newErrors.phone = language === 'gu' ? 'ફોન આવશ્યક છે' : language === 'hi' ? 'फोन आवश्यक है' : 'Phone is required';
    } else if (!/^\d{10}$/.test(donorInfo.phone)) {
      newErrors.phone = language === 'gu' ? 'અવૈધ ફોન નંબર' : language === 'hi' ? 'अवैध फोन नंबर' : 'Invalid phone number';
    }
    if (donorInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorInfo.email)) {
      newErrors.email = language === 'gu' ? 'અવૈધ ઇમેઇલ' : language === 'hi' ? 'अवैध ईमेल' : 'Invalid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (step === 1 && getAmount() > 0) {
      setStep(2);
      return;
    }
    if (step === 2 && !donorInfo.isAnonymous && !validateStep2()) {
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase.from('donations').insert({
        amount: getAmount(),
        category: selectedCategory,
        donor_name: donorInfo.isAnonymous ? 'Anonymous' : donorInfo.name,
        donor_email: donorInfo.email || null,
        donor_phone: donorInfo.phone || null,
        donor_address: donorInfo.address || null,
        pan_number: donorInfo.pan || null,
        is_anonymous: donorInfo.isAnonymous,
        payment_method: paymentMethod,
        status: 'completed',
      });

      if (error) throw error;
      setIsSuccess(true);
    } catch (error) {
      console.error('Donation error:', error);
      setErrors({ submit: language === 'gu' ? 'ભૂલ થઈ. ફરી પ્રયત્ન કરો.' : language === 'hi' ? 'त्रुटि हुई। पुनः प्रयास करें।' : 'Error occurred. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-temple-bg dark:bg-gray-900 pt-6 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="font-display text-3xl font-bold text-temple-text dark:text-white mb-4">
              {language === 'gu' ? 'દાન સફળ!' : language === 'hi' ? 'दान सफल!' : 'Donation Successful!'}
            </h1>
            <p className="text-temple-muted dark:text-gray-400 mb-6">
              {language === 'gu'
                ? 'તમારા દાન માટે આભાર. રસીદ તમારા ઇમેઇલ પર મોકલવામાં આવશે.'
                : language === 'hi'
                ? 'आपके दान के लिए धन्यवाद। रसीद आपके ईमेल पर भेजी जाएगी।'
                : 'Thank you for your donation. A receipt will be sent to your email.'}
            </p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-8">
              ₹{getAmount().toLocaleString('en-IN')}
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-temple text-white rounded-xl font-semibold shadow-temple hover:shadow-temple-lg transition-all"
            >
              {language === 'gu' ? 'હોમ પેજ પર જાઓ' : language === 'hi' ? 'होम पेज पर जाएं' : 'Go to Home'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-temple-bg dark:bg-gray-900 pt-6 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-temple-text dark:text-white mb-4">
              {t('donation_title')}
            </h1>
            <p className="text-temple-muted dark:text-gray-400">
              {t('donation_subtitle')}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
              <Shield className="w-4 h-4" />
              {t('tax_benefit')}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    s <= step ? 'bg-primary-500 text-white' : 'bg-temple-border dark:bg-gray-700 text-temple-muted dark:text-gray-400'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-1 ${s < step ? 'bg-primary-500' : 'bg-temple-border dark:bg-gray-700'}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-temple-lg overflow-hidden">
            {/* Step 1: Select Category & Amount */}
            {step === 1 && (
              <div className="p-6 md:p-8">
                {/* Category Selection */}
                <div className="mb-8">
                  <h3 className="font-semibold text-temple-text dark:text-white mb-4">
                    {language === 'gu' ? 'દાનનો પ્રકાર પસંદ કરો' : language === 'hi' ? 'दान का प्रकार चुनें' : 'Select Donation Type'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {donationCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedCategory === cat.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                            : 'border-temple-border dark:border-gray-700 hover:border-primary-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3`}>
                          <cat.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="font-medium text-temple-text dark:text-white text-sm">
                          {getCategoryLabel(cat.id)}
                        </div>
                        <div className="text-xs text-temple-muted dark:text-gray-400 mt-1">
                          {getCategoryDescription(cat.id)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Selection */}
                <div>
                  <h3 className="font-semibold text-temple-text dark:text-white mb-4">
                    {t('select_amount')}
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {predefinedAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                        className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                          selectedAmount === amount
                            ? 'border-primary-500 bg-primary-500 text-white'
                            : 'border-temple-border dark:border-gray-700 hover:border-primary-300 text-temple-text dark:text-white'
                        }`}
                      >
                        ₹{amount.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-temple-muted dark:text-gray-400 font-semibold">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder={t('custom_amount')}
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-temple-border dark:border-gray-700 bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Donor Information */}
            {step === 2 && (
              <div className="p-6 md:p-8">
                <h3 className="font-semibold text-temple-text dark:text-white mb-6">
                  {language === 'gu' ? 'તમારી વિગતો' : language === 'hi' ? 'आपकी जानकारी' : 'Your Details'}
                </h3>

                <div className="mb-6">
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-temple-border dark:border-gray-700 cursor-pointer hover:border-primary-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={donorInfo.isAnonymous}
                      onChange={(e) => setDonorInfo({ ...donorInfo, isAnonymous: e.target.checked })}
                      className="w-5 h-5 rounded border-temple-border text-primary-500 focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-temple-text dark:text-white">
                        {t('make_anonymous')}
                      </span>
                      <p className="text-sm text-temple-muted dark:text-gray-400">
                        {language === 'gu' ? 'તમારું નામ જાહેર કરાશે નહીં' : language === 'hi' ? 'आपका नाम सार्वजनिक नहीं होगा' : 'Your name will not be made public'}
                      </p>
                    </div>
                  </label>
                </div>

                {!donorInfo.isAnonymous && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-temple-text dark:text-white mb-2">
                        {t('donor_name')} *
                      </label>
                      <input
                        type="text"
                        value={donorInfo.name}
                        onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.name ? 'border-red-500' : 'border-temple-border dark:border-gray-600'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-temple-text dark:text-white mb-2">
                          {t('donor_email')}
                        </label>
                        <input
                          type="email"
                          value={donorInfo.email}
                          onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.email ? 'border-red-500' : 'border-temple-border dark:border-gray-600'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-temple-text dark:text-white mb-2">
                          {t('donor_phone')} *
                        </label>
                        <input
                          type="tel"
                          value={donorInfo.phone}
                          onChange={(e) => setDonorInfo({ ...donorInfo, phone: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.phone ? 'border-red-500' : 'border-temple-border dark:border-gray-600'
                          }`}
                        />
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-temple-text dark:text-white mb-2">
                        {t('donor_address')}
                      </label>
                      <textarea
                        value={donorInfo.address}
                        onChange={(e) => setDonorInfo({ ...donorInfo, address: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-temple-border dark:border-gray-600 bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-temple-text dark:text-white mb-2">
                        {t('pan_number')} ({language === 'gu' ? '80G રસીદ માટે' : language === 'hi' ? '80G रसीद के लिए' : 'For 80G receipt'})
                      </label>
                      <input
                        type="text"
                        value={donorInfo.pan}
                        onChange={(e) => setDonorInfo({ ...donorInfo, pan: e.target.value.toUpperCase() })}
                        maxLength={10}
                        className="w-full px-4 py-3 rounded-xl border border-temple-border dark:border-gray-600 bg-temple-bg dark:bg-gray-700 text-temple-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="p-6 md:p-8">
                <h3 className="font-semibold text-temple-text dark:text-white mb-6">
                  {t('payment_method')}
                </h3>

                <div className="space-y-4">
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-temple-border dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-temple-text dark:text-white">UPI</div>
                      <div className="text-sm text-temple-muted dark:text-gray-400">
                        Google Pay, PhonePe, Paytm
                      </div>
                    </div>
                    {paymentMethod === 'upi' && <Check className="w-5 h-5 text-primary-500 ml-auto" />}
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-temple-border dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-temple-text dark:text-white">
                        {language === 'gu' ? 'ડેબિટ/ક્રેડિટ કાર્ડ' : language === 'hi' ? 'डेबिट/क्रेडिट कार्ड' : 'Debit/Credit Card'}
                      </div>
                      <div className="text-sm text-temple-muted dark:text-gray-400">
                        Visa, Mastercard, RuPay
                      </div>
                    </div>
                    {paymentMethod === 'card' && <Check className="w-5 h-5 text-primary-500 ml-auto" />}
                  </button>

                  <button
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-temple-border dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-temple-text dark:text-white">
                        {language === 'gu' ? 'નેટબેન્કિંગ' : language === 'hi' ? 'नेटबैंकिंग' : 'Net Banking'}
                      </div>
                      <div className="text-sm text-temple-muted dark:text-gray-400">
                        {language === 'gu' ? 'બધા મુખ્ય બેંકો' : language === 'hi' ? 'सभी प्रमुख बैंक' : 'All major banks'}
                      </div>
                    </div>
                    {paymentMethod === 'netbanking' && <Check className="w-5 h-5 text-primary-500 ml-auto" />}
                  </button>
                </div>
              </div>
            )}

            {/* Summary & Actions */}
            <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-900 border-t border-temple-border dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="text-temple-muted dark:text-gray-400">
                  {getCategoryLabel(selectedCategory)}
                </div>
                <div className="text-2xl font-bold text-temple-text dark:text-white">
                  ₹{getAmount().toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex gap-4">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-3 rounded-xl border border-temple-border dark:border-gray-600 text-temple-text dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {language === 'gu' ? 'પાછળ' : language === 'hi' ? 'पीछे' : 'Back'}
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || (step === 1 && getAmount() <= 0) || (step === 2 && !donorInfo.isAnonymous && !donorInfo.name)}
                  className="flex-1 py-3 rounded-xl bg-gradient-temple text-white font-semibold hover:shadow-temple-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : step === 3 ? (
                    <>
                      <Heart className="w-5 h-5" />
                      {t('proceed_payment')}
                    </>
                  ) : (
                    t('continue')
                  )}
                </button>
              </div>

              {errors.submit && (
                <p className="mt-4 text-center text-sm text-red-500 flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.submit}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
