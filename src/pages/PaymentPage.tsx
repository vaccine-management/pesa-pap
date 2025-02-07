import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

interface PaymentLink {
  id: string;
  amount: number;
  description: string;
  recipient_phone: string;
}

export default function PaymentPage() {
  const { linkId } = useParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    loadPaymentLink();
  }, [linkId]);

  const loadPaymentLink = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_links")
        .select("*")
        .eq("id", linkId)
        .single();

      if (error) throw error;
      setPaymentLink(data);
    } catch (error) {
      console.error("Error loading payment link:", error);
      toast.error("Payment link not found");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Here you would integrate with your M-Pesa API
      // For now, we'll just create a transaction record
      const { error } = await supabase.from("transactions").insert({
        payment_link_id: linkId,
        amount: paymentLink?.amount,
        payer_phone: phoneNumber,
        status: "pending",
      });

      if (error) throw error;

      toast.success(
        "STK push sent to your phone. Please enter your M-Pesa PIN to complete the payment."
      );
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!paymentLink) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Link Not Found
          </h1>
          <p className="text-gray-600">
            This payment link may have expired or been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Payment
          </h1>
          <p className="text-gray-600">{paymentLink.description}</p>
        </div>

        <div className="border-t border-b border-gray-200 py-4 my-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount:</span>
            <span className="text-2xl font-bold text-gray-900">
              KES {paymentLink.amount.toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              M-Pesa Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="254700000000"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>You will receive an STK push notification on your phone.</p>
          <p>Enter your M-Pesa PIN to complete the payment.</p>
        </div>
      </div>
    </div>
  );
}
