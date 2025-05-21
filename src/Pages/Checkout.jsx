import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Checkout = () => {
    const cart = useSelector((state) => state.cart);
    const navigate = useNavigate();
    const [shippingMethods, setShippingMethods] = useState([]);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: ''
    });
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

    useEffect(() => {
        fetchShippingMethods();
    }, []);

    const fetchShippingMethods = async () => {
        try {
            const response = await axios.get('/api/shipping');
            setShippingMethods(response.data);
            if (response.data.length > 0) {
                setSelectedShipping(response.data[0]);
            }
        } catch (err) {
            console.error('Error fetching shipping methods:', err);
            toast.error('Failed to fetch shipping methods');
        }
    };

    const handleShippingSelect = (method) => {
        setSelectedShipping(method);
    };

    const handleDiscountApply = async () => {
        if (!discountCode.trim()) {
            toast.error('Please enter a discount code');
            return;
        }

        try {
            const response = await axios.post('/api/discounts/validate', {
                code: discountCode,
                totalAmount: calculateSubtotal()
            });

            setAppliedDiscount(response.data);
            toast.success('Discount applied successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid discount code');
        }
    };

    const calculateSubtotal = () => {
        return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateShipping = () => {
        if (!selectedShipping) return 0;
        if (selectedShipping.isFree) return 0;
        return selectedShipping.price;
    };

    const calculateDiscount = () => {
        if (!appliedDiscount) return 0;
        return appliedDiscount.discountAmount;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const shipping = calculateShipping();
        const discount = calculateDiscount();
        return subtotal + shipping - discount;
    };

    const handleCheckout = async () => {
        if (!selectedShipping) {
            toast.error('Please select a shipping method');
            return;
        }

        if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                items: cart.items.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.price
                })),
                shippingAddress: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    street: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country || 'United States'
                },
                shippingMethod: selectedShipping._id,
                discountCode: appliedDiscount?.discount?._id,
                subtotal: calculateSubtotal(),
                shippingCost: calculateShipping(),
                discountAmount: calculateDiscount(),
                totalAmount: calculateTotal(),
                paymentMethod: selectedPaymentMethod,
                customerName: formData.name,
                customerEmail: formData.email
            };

            const response = await axios.post('/api/orders', orderData);

            if (selectedPaymentMethod === 'card') {
                // Handle card payment
                const { clientSecret, orderId } = response.data;
                // Redirect to payment confirmation page
                navigate(`/payment-confirmation/${orderId}`, { 
                    state: { clientSecret, orderId }
                });
            } else {
                // Handle cash on delivery
                toast.success('Order placed successfully!');
                navigate(`/order-confirmation/${response.data.orderId}`);
            }
        } catch (err) {
            console.error('Error placing order:', err);
            toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-4">
                        {cart.items.map((item) => (
                            <div key={item._id} className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t mt-6 pt-6 space-y-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{selectedShipping?.isFree ? 'Free' : `$${calculateShipping().toFixed(2)}`}</span>
                        </div>
                        {appliedDiscount && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-${calculateDiscount().toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Shipping and Discount */}
                <div className="space-y-6">
                    {/* Shipping Methods */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
                        <div className="space-y-4">
                            {shippingMethods.map((method) => (
                                <div
                                    key={method._id}
                                    className={`border rounded-lg p-4 cursor-pointer ${
                                        selectedShipping?._id === method._id ? 'border-indigo-600 bg-indigo-50' : ''
                                    }`}
                                    onClick={() => handleShippingSelect(method)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium">{method.name}</h3>
                                            <p className="text-sm text-gray-500">{method.deliveryTime}</p>
                                        </div>
                                        <p className="font-medium">
                                            {method.isFree ? 'Free' : `$${method.price.toFixed(2)}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Discount Code */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Discount Code</h2>
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                placeholder="Enter discount code"
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <button
                                onClick={handleDiscountApply}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                                Apply
                            </button>
                        </div>
                        {appliedDiscount && (
                            <div className="mt-4 p-4 bg-green-50 rounded-md">
                                <p className="text-green-700">
                                    Discount applied: {appliedDiscount.discount.type === 'percentage' 
                                        ? `${appliedDiscount.discount.value}%` 
                                        : `$${appliedDiscount.discount.value}`}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Checkout Button */}
                    <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout; 