import { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShopContext } from '../Context/shopcontext';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../Context/AuthContext';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { currency } = useContext(ShopContext);
  const { user } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showPreOrderLoginPrompt, setShowPreOrderLoginPrompt] = useState(!user);
  const [orderId, setOrderId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentMethod: 'card'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartData, setCartData] = useState([]);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 10,
    tax: 0,
    total: 0
  });
  const [activeStep, setActiveStep] = useState(1);

  // Add country codes mapping
  const countryCodes = {
    'PK': 'Pakistan',
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'IN': 'India',
    'CN': 'China',
    'JP': 'Japan',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'BR': 'Brazil',
    'RU': 'Russia',
    'ZA': 'South Africa',
    'AE': 'United Arab Emirates',
    'SA': 'Saudi Arabia',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'TH': 'Thailand'
  };

  useEffect(() => {
    const checkoutData = localStorage.getItem('checkoutData');
    if (checkoutData) {
      const data = JSON.parse(checkoutData);
      if (!data.items || data.items.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }
      setCartData(data.items);
      setOrderSummary({
        subtotal: data.subtotal,
        shipping: data.shipping,
        tax: data.tax,
        total: data.total
      });
    } else {
      navigate('/cart');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate cart data
    if (!cartData || cartData.length === 0) {
      toast.error('Your cart is empty');
      setIsProcessing(false);
      return;
    }

    const errors = {};
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.state) errors.state = 'State is required';
    if (!formData.zipCode) errors.zipCode = 'ZIP code is required';
    if (!formData.country) errors.country = 'Country is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsProcessing(false);
      return;
    }

    try {
      let orderId;

      // Prepare order data
      const orderData = {
        items: cartData.map(item => ({
          product: item._id,
          quantity: item.quantity,
          size: item.size === "null" ? "default" : item.size,
          price: parseFloat(item.price.toFixed(2))
        })),
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod,
        totalAmount: parseFloat(orderSummary.total.toFixed(2)),
        shippingCost: parseFloat(orderSummary.shipping.toFixed(2)),
        taxPrice: parseFloat(orderSummary.tax.toFixed(2)),
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email
      };

      console.log('Sending order data:', orderData);

      // Create order
      const response = await api.post('/api/orders', orderData);
      console.log('Order creation response:', response.data);

      if (!response.data) {
        throw new Error('No response data received from server');
      }

      orderId = response.data.orderId;
      setOrderId(orderId);
      console.log('Order created with ID:', orderId);

      // Clear cart after successful order
      localStorage.removeItem('cart');
      localStorage.removeItem('checkoutData');

      if (formData.paymentMethod === 'card') {
        // For card payments, redirect to payment confirmation
        navigate(`/payment-confirmation/${orderId}`, {
          state: { 
            clientSecret: response.data.clientSecret,
            orderId: orderId
          }
        });
      } else {
        // For cash on delivery
        toast.success('Order placed successfully!');
        navigate(`/order-confirmation/${orderId}`);
      }
      
      // Store order ID in localStorage for later use
      localStorage.setItem('lastOrderId', orderId);
    } catch (error) {
      console.error('Error processing order:', error);
      console.log('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMessage = 'Failed to process order. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (showPreOrderLoginPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Before You Place Your Order</h2>
              <p className="text-gray-600 mb-4">
                Creating an account will help you track your order and view your order history.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      As a guest, you won't be able to track your order status or view your order history.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/login', { state: { from: '/place-order' } })}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Login to Your Account
              </button>
              <button
                onClick={() => navigate('/register', { state: { from: '/place-order' } })}
                className="w-full bg-white text-gray-900 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Create New Account
              </button>
              <button
                onClick={() => setShowPreOrderLoginPrompt(false)}
                className="w-full text-gray-600 hover:text-gray-900 transition-colors"
              >
                Continue as Guest
              </button>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>You can always create an account later to track your order.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showLoginPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-600">Your order has been placed successfully.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Order Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">{currency} {orderSummary.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{formData.paymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery'}</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="text-gray-600 mb-4">
                To track your order and view your order history, please create an account or login.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/login', { state: { from: `/order/${orderId}` } })}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register', { state: { from: `/order/${orderId}` } })}
                  className="w-full bg-white text-gray-900 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Create Account
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Continue as Guest
                </button>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>You can always login later to track your order using your order number.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Please add items to your cart before placing an order.</p>
            <button
              onClick={() => navigate('/cart')}
              className="bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { number: 1, label: 'Shipping' },
                { number: 2, label: 'Payment' },
                { number: 3, label: 'Review' }
              ].map((step) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activeStep >= step.number
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className="ml-2 text-sm font-medium">{step.label}</span>
                  {step.number < 3 && (
                    <div className="w-24 h-0.5 mx-4 bg-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{currency} {orderSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{currency} {orderSummary.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>{currency} {orderSummary.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{currency} {orderSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-4">Order Items</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {cartData.map((item, index) => (
                      <div key={index} className="flex gap-4 bg-gray-50 p-3 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-500">Size: {item.size}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-gray-600">{currency} {item.price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {currency} {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
                {/* Shipping Information */}
                <div className={activeStep === 1 ? 'block' : 'hidden'}>
                  <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 ${
                          formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 ${
                          formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 ${
                          formErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 ${
                          formErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 ${
                          formErrors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.address && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 ${
                          formErrors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 ${
                          formErrors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.state && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 ${
                          formErrors.zipCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.zipCode && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.zipCode}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 ${
                          formErrors.country ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a country</option>
                        {Object.entries(countryCodes).map(([code, name]) => (
                          <option key={code} value={code}>
                            {name}
                          </option>
                        ))}
                      </select>
                      {formErrors.country && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="bg-gray-900 text-white py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>

                {/* Payment Information */}
                <div className={activeStep === 2 ? 'block' : 'hidden'}>
                  <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4">Payment Method</label>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === 'card'}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="h-4 w-4 text-gray-900"
                        />
                        <span className="text-gray-900">Credit/Debit Card</span>
                      </label>
                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="h-4 w-4 text-gray-900"
                        />
                        <span className="text-gray-900">Cash on Delivery</span>
                      </label>
                    </div>
                  </div>

                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div className="border p-4 rounded-lg">
                        <CardElement
                          options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                  color: '#aab7c4'
                                }
                              },
                              invalid: {
                                color: '#9e2146'
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'cod' && (
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                      <h3 className="font-medium mb-2">Cash on Delivery</h3>
                      <p className="text-gray-600 text-sm">
                        You will pay the total amount of {currency} {orderSummary.total.toFixed(2)} when your order arrives.
                      </p>
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      ← Back to Shipping
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="bg-gray-900 text-white py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Review Order
                    </button>
                  </div>
                </div>

                {/* Review Order */}
                <div className={activeStep === 3 ? 'block' : 'hidden'}>
                  <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold mb-4">Shipping Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-medium">{formData.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Address</p>
                        <p className="font-medium">{formData.address}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">City</p>
                        <p className="font-medium">{formData.city}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">State</p>
                        <p className="font-medium">{formData.state}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">ZIP Code</p>
                        <p className="font-medium">{formData.zipCode}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Country</p>
                        <p className="font-medium">{countryCodes[formData.country] || formData.country}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold mb-4">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Payment Method</p>
                        <p className="font-medium">
                          {formData.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                        </p>
                      </div>
                      {formData.paymentMethod === 'card' && (
                        <div>
                          <p className="text-gray-600">Card Details</p>
                          <p className="font-medium">Entered in the payment form</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {formErrors.submit && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                      {formErrors.submit}
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      ← Back to Payment
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={`bg-gray-900 text-white py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlaceOrder;