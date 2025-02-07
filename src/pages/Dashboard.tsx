import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Plus, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface PaymentLink {
  id: string;
  amount: number;
  description: string;
  recipient_phone: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useUser();
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    recipient_phone: ''
  });

  const createPaymentLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('payment_links')
        .insert([{
          user_id: user?.id,
          amount: parseFloat(formData.amount),
          description: formData.description,
          recipient_phone: formData.recipient_phone
        }])
        .select()
        .single();

      if (error) throw error;

      setPaymentLinks([data as PaymentLink, ...paymentLinks]);
      setIsCreating(false);
      setFormData({ amount: '', description: '', recipient_phone: '' });
      toast.success('Payment link created successfully!');
    } catch (error) {
      toast.error('Failed to create payment link');
      console.error(error);
    }
  };

  const copyPaymentLink = (id: string) => {
    const link = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Payment link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Links</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Link
          </button>
        </div>

        {isCreating && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Create Payment Link</h2>
            <form onSubmit={createPaymentLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (KES)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Recipient M-Pesa Number</label>
                <input
                  type="tel"
                  value={formData.recipient_phone}
                  onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="254700000000"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Link
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {paymentLinks.map((link) => (
              <div key={link.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-900">KES {link.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{link.description}</p>
                  <p className="text-sm text-gray-500">To: {link.recipient_phone}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => copyPaymentLink(link.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <Copy className="w-5 h-5" />
                    Copy Link
                  </button>
                  <Link
                    to={`/pay/${link.id}`}
                    target="_blank"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Open
                  </Link>
                </div>
              </div>
            ))}
            {paymentLinks.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No payment links yet. Create one to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}