import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import api from '../utils/axios';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation/${useParams().orderId}`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Complete Your Payment</h2>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const PaymentConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        if (location.state?.clientSecret) {
          setClientSecret(location.state.clientSecret);
        } else {
          const response = await api.get(`/api/orders/${orderId}/payment-intent`);
          setClientSecret(response.data.clientSecret);
        }
      } catch (error) {
        console.error('Error fetching payment intent:', error);
        toast.error('Failed to load payment form. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [orderId, location.state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Payment Error</h2>
          <p className="text-gray-600">Unable to load payment form. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm clientSecret={clientSecret} />
        </Elements>
      </div>
    </div>
  );
};

export default PaymentConfirmation; 