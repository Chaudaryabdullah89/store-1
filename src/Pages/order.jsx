import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { ShopContext } from '../Context/shopcontext';

const Order = () => {
  const { all_product, cartItems, addToCart, removeFromCart } = useContext(ShopContext);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Calculate total amount
  const calculateTotal = () => {
    if (!cartItems || !all_product) return 0;
    
    let total = 0;
    Object.entries(cartItems).forEach(([productId, quantity]) => {
      const product = all_product.find(p => p.id === parseInt(productId));
      if (product) {
        total += product.new_price * quantity;
      }
    });
    return total;
  };

  // Convert cart items to order format
  const [orders] = useState([
    {
      id: 'ORD001',
      date: new Date().toISOString(),
      status: 'Processing',
      total: calculateTotal(),
      trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      shippingAddress: {
        name: 'John Doe',
        street: '123 Fashion Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States'
      },
      items: cartItems && all_product ? Object.entries(cartItems).map(([productId, quantity]) => {
        const product = all_product.find(p => p.id === parseInt(productId));
        if (!product) return null;
        return {
          id: product.id,
          name: product.name,
          quantity: quantity,
          price: product.new_price,
          image: product.image
        };
      }).filter(Boolean) : [],
      paymentMethod: 'Credit Card (**** 1234)',
      subtotal: calculateTotal(),
      shipping: 10.00,
      tax: calculateTotal() * 0.1, // 10% tax
      discount: 0.00
    }
  ]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReorder = (order) => {
    if (!cartItems) return;
    
    // Clear current cart
    Object.keys(cartItems).forEach(productId => {
      removeFromCart(parseInt(productId));
    });
    
    // Add items from the order to cart
    order.items.forEach(item => {
      if (item && item.id) {
        addToCart(item.id, item.quantity);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Order History</h2>
              </div>
              <div className="divide-y">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedOrder?.id === order.id ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-gray-600">${order.total.toFixed(2)}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-sm"
              >
                {/* Order Header */}
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold">Order #{selectedOrder.id}</h2>
                      <p className="text-gray-500">Placed on {formatDate(selectedOrder.date)}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-gray-600">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Shipping Address</h4>
                      <p>{selectedOrder.shippingAddress.name}</p>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Tracking Information</h4>
                      <p className="text-gray-600">Tracking Number: {selectedOrder.trackingNumber}</p>
                      <p className="text-gray-600">Estimated Delivery: {formatDate(selectedOrder.estimatedDelivery)}</p>
                      <button className="mt-2 text-gray-900 hover:text-gray-700 transition-colors">
                        Track Package →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>${selectedOrder.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${selectedOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Payment Method</h4>
                    <p className="text-gray-600">{selectedOrder.paymentMethod}</p>
                  </div>
                  <button
                    onClick={() => handleReorder(selectedOrder)}
                    className="mt-6 w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Reorder Items
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">Select an order to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;