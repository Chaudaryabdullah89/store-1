import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../utils/axios';
import { FaStar, FaShoppingCart, FaHeart, FaShare } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../Context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await axios.get(`/api/products/${id}`);
      return response.data;
    },
  });

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product?.stock) {
      setQuantity(value);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await axios.post('/api/cart', {
        productId: id,
        quantity,
      });
      toast.success('Product added to cart successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product to cart');
    }
  };

  // Handle add to wishlist
  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      await axios.post('/api/wishlist', {
        productId: id,
      });
      toast.success('Product added to wishlist successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product to wishlist');
    }
  };

  if (error) {
    toast.error('Failed to load product details');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading product details. Please try again later.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-w-1 aspect-h-1 overflow-hidden rounded-lg ${
                    selectedImage === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="mt-2 flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={`${
                        index < Math.floor(product.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      } h-5 w-5`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">({product.numReviews} reviews)</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-gray-900">${product.price}</div>

            <div className="prose prose-sm text-gray-500">
              <p>{product.description}</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <label htmlFor="quantity" className="mr-2 text-gray-700">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-gray-600">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaShoppingCart className="inline-block mr-2" />
                Add to Cart
              </button>
              <button
                onClick={handleAddToWishlist}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaHeart className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={() => {
                  navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                  });
                }}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaShare className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.category}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Brand</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.brand}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">SKU</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.sku}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Shipping</dt>
                  <dd className="mt-1 text-sm text-gray-900">Free shipping on orders over $50</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 