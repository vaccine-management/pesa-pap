import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Plus, Copy, ExternalLink, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import axios from 'axios';

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

  // Fetch payment links on component mount
  useEffect(() => {
    fetchPaymentLinks();
  }, []);

  const fetchPaymentLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_links')
        .select('*')
        .eq('user_id', user?.id); // Fetch payment links for the current user

      if (error) {
        console.error('Supabase Error:', error); // Log Supabase error
        throw error;
      }

      console.log('Fetched Data:', data); // Log fetched data

      setPaymentLinks(data as PaymentLink[]);
    } catch (error) {
      console.error('Error fetching payment links:', error); // Log general error
    }
  };

  const createPaymentLink = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Form Data:', formData); // Log form data

      const { data, error } = await supabase
        .from('payment_links')
        .insert([{
          user_id: user?.id,
          amount: parseFloat(formData.amount),
          description: formData.description,
          recipient_phone: formData.recipient_phone,
          status: 'active',
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase Error:', error); // Log Supabase error
        throw error;
      }

      console.log('Inserted Data:', data); // Log inserted data

      // send the whatsapp message
 
      try{
 
        await axios.post("https://api.apiwap.com/api/v1/whatsapp/send-message",{

       "phoneNumber": `+${formData.recipient_phone}`,
    "message": `Hello, you have a payment link of KES ${formData.amount} to pay. Click on the link to pay:\n\nhttp://mylink.com/pay/${data.id}`,
    "type": "text"
        },{
          headers:{
            "Authorization":`Bearer 215f5122ce3f4b86ede84a26918d69325b9401ffe9a12998a37dd1af72591abb`
          }
        })
      }catch(error){
        console.log("failed to send message")
      }

      setPaymentLinks([data as PaymentLink, ...paymentLinks]);
      setIsCreating(false);
      setFormData({ amount: '', description: '', recipient_phone: '' });
      toast.success('Payment link created successfully!');
    } catch (error) {
      toast.error('Failed to create payment link');
      console.error('Error:', error); // Log general error
    }
  };

  const copyPaymentLink = (id: string) => {
    const link = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Payment link copied to clipboard!');
  };

  const deletePaymentLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPaymentLinks(paymentLinks.filter(link => link.id !== id));
      toast.success('Payment link deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete payment link');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Links</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentLinks.map((link) => (
            <div
              key={link.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-medium text-gray-900">KES {link.amount.toLocaleString()}</p>
                <span className={`px-2 py-1 text-sm rounded-full ${link.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {link.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{link.description}</p>
              <p className="text-sm text-gray-500 mb-4">To: {link.recipient_phone}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => copyPaymentLink(link.id)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Copy className="w-5 h-5" />
                  Copy
                </button>
                <Link
                  to={`/pay/${link.id}`}
                  target="_blank"
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-800"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open
                </Link>
                <button
                  onClick={() => deletePaymentLink(link.id)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-800"
                >
                  <Trash className="w-5 h-5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
          {paymentLinks.length === 0 && (
            <div className="col-span-full text-center text-gray-500">
              No payment links yet. Create one to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}