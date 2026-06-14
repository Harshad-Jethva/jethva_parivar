import { useState, useEffect } from 'react';
import { supabase, Donation } from '../../lib/supabase';
import { Heart, DollarSign, Sparkles, Shield, ToggleLeft, ToggleRight, CheckCircle, Save } from 'lucide-react';

export function DonationsManager() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totals, setTotals] = useState({
    total: 0,
    annadan: 0,
    gaushala: 0,
    development: 0,
    general: 0
  });

  // Payment method toggles
  const [payUPI, setPayUPI] = useState(true);
  const [payRazorpay, setPayRazorpay] = useState(true);
  const [payStripe, setPayStripe] = useState(false);
  const [payBank, setPayBank] = useState(true);

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadDonations();
    loadPaymentGateways();
  }, []);

  const loadDonations = async () => {
    try {
      const { data, error } = await supabase.from('donations').select('*').order('donation_date', { ascending: false });
      if (error) throw error;
      const list = data || [];
      setDonations(list);

      // Compute statistics
      let t = 0, a = 0, g = 0, d = 0, gen = 0;
      list.forEach((item: any) => {
        const amt = Number(item.amount);
        t += amt;
        if (item.category === 'annadan') a += amt;
        else if (item.category === 'gaushala') g += amt;
        else if (item.category === 'development') d += amt;
        else gen += amt;
      });

      setTotals({ total: t, annadan: a, gaushala: g, development: d, general: gen });
    } catch (err) {
      console.error('Error loading donations:', err);
    }
  };

  const loadPaymentGateways = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        data.forEach((item: any) => {
          if (item.key === 'payment_upi') setPayUPI(item.value === 'true');
          if (item.key === 'payment_razorpay') setPayRazorpay(item.value === 'true');
          if (item.key === 'payment_stripe') setPayStripe(item.value === 'true');
          if (item.key === 'payment_bank') setPayBank(item.value === 'true');
        });
      }
    } catch (err) {
      console.error('Error loading payment methods:', err);
    }
  };

  const savePaymentMethods = async () => {
    try {
      const methods = [
        { key: 'payment_upi', value: String(payUPI) },
        { key: 'payment_razorpay', value: String(payRazorpay) },
        { key: 'payment_stripe', value: String(payStripe) },
        { key: 'payment_bank', value: String(payBank) },
      ];

      for (const m of methods) {
        const { data } = await supabase.from('site_settings').select('id').eq('key', m.key);
        if (data && data.length > 0) {
          await supabase.from('site_settings').update({ value: m.value }, data[0].id);
        } else {
          await supabase.from('site_settings').insert(m);
        }
      }

      setMessage({ type: 'success', text: 'Payment methods configuration updated!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating payment gateways.' });
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Donations & Funds Ledger</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track online transactions, generate receipts, and manage payment methods.</p>
        </div>
        <button
          onClick={savePaymentMethods}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium shadow"
        >
          <Save className="w-5 h-5" />
          Save Gateways
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Funds</span>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(totals.total)}</p>
          <div className="text-[10px] text-green-600 font-medium mt-1">100% Tax Exempted (80G)</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Gaushala Fund</span>
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(totals.gaushala)}</p>
          <div className="text-[10px] text-gray-400 mt-1">Allocated to cow shelter</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Annadan Fund</span>
            <Sparkles className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(totals.annadan)}</p>
          <div className="text-[10px] text-gray-400 mt-1">Allocated to daily meals</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Development</span>
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(totals.development)}</p>
          <div className="text-[10px] text-gray-400 mt-1">Temple construction fund</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Table: Transactions List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">Transaction Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-semibold uppercase border-b border-gray-100 dark:border-gray-700">
                  <th className="px-4 py-3">Donor Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-800 dark:text-white block">{d.donor_name}</span>
                      <span className="text-[10px] text-gray-400 block">{d.receipt_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 capitalize font-medium">{d.category}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">{formatCurrency(Number(d.amount))}</td>
                    <td className="px-4 py-3 capitalize text-gray-500">{d.payment_method || 'UPI'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600">
                        <CheckCircle className="w-3 h-3" /> Sent
                      </span>
                    </td>
                  </tr>
                ))}

                {donations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400">
                      No transaction records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: Payment Method Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Payment Methods Config</h3>
            
            <div className="space-y-4">
              
              <div className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg">
                <div>
                  <span className="font-semibold text-sm text-gray-800 dark:text-white block">UPI Payments</span>
                  <span className="text-[10px] text-gray-400 block">GPay, PhonePe, Bhim UPI</span>
                </div>
                <button onClick={() => setPayUPI(!payUPI)} className="text-primary-500">
                  {payUPI ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-gray-300" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg">
                <div>
                  <span className="font-semibold text-sm text-gray-800 dark:text-white block">Razorpay Gateway</span>
                  <span className="text-[10px] text-gray-400 block">Cards, Netbanking, Wallets</span>
                </div>
                <button onClick={() => setPayRazorpay(!payRazorpay)} className="text-primary-500">
                  {payRazorpay ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-gray-300" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg">
                <div>
                  <span className="font-semibold text-sm text-gray-800 dark:text-white block">Stripe Checkout</span>
                  <span className="text-[10px] text-gray-400 block">International Cards & Apple Pay</span>
                </div>
                <button onClick={() => setPayStripe(!payStripe)} className="text-primary-500">
                  {payStripe ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-gray-300" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg">
                <div>
                  <span className="font-semibold text-sm text-gray-800 dark:text-white block">Direct Bank Transfer</span>
                  <span className="text-[10px] text-gray-400 block">Show account numbers on screen</span>
                </div>
                <button onClick={() => setPayBank(!payBank)} className="text-primary-500">
                  {payBank ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-gray-300" />}
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
