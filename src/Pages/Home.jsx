import { useEffect, useState } from 'react';
import api from '../utils/axios';
import Hero from '../Components/hero'
import Newsletter from '../Components/Newsletter'
import Policy from '../Components/Policy'
import FeaturedCategories from '../Components/FeaturedCategories'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products');
        console.log('Products response:', response.data);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err);
        toast.error('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/products', {
          params: { featured: true }
        });
        console.log('Featured products response:', response.data);
        setFeaturedProducts(response.data);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        toast.error('Failed to load featured products. Please try again later.');
      }
    };

    fetchAllProducts();
    fetchFeaturedProducts();
  }, []);

  const createProduct = async (productData) => {
    try {
      // Log the raw product data
      console.log('Raw product data:', productData);
      
      // Validate product data
      if (!productData || Object.keys(productData).length === 0) {
        throw new Error('Product data is empty');
      }

      // Check required fields
      const requiredFields = ['name', 'description', 'price', 'category', 'stock', 'image', 'brand'];
      const missingFields = requiredFields.filter(field => !productData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const token = localStorage.getItem('token');
      console.log('Token status:', token ? 'Present' : 'Missing');

      // Log the request configuration
      const requestConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      };
      console.log('Request configuration:', requestConfig);

      // Log the stringified body
      console.log('Request body:', JSON.stringify(productData, null, 2));

      const response = await fetch('http://localhost:5000/api/products', requestConfig);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to create product');
      }

      const data = await response.json();
      console.log('Product created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const loadMoreProducts = () => {
    setVisibleProducts(prev => prev + 8);
    setHasMore(visibleProducts + 8 < products.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error loading products</p>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Main Content Section */}
      <div className="bg-white">
        <FeaturedCategories />
        
        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="max-w-[1280px] mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover our handpicked selection of premium products, chosen for their exceptional quality and style.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <div 
                  key={product._id} 
                  className="group bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {/* Product Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discount && (
                      <div className="absolute top-3 left-3 bg-gray-900 text-white px-2.5 py-1 rounded text-sm font-medium">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-sm text-gray-600">{product.rating || '4.5'}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-semibold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-800 transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Products Section */}
        <div className="max-w-[1280px] mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our complete collection of high-quality products.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, visibleProducts).map(product => (
              <div 
                key={product._id} 
                className="group bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                {/* Product Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm text-gray-600">{product.rating || '4.5'}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    <button className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-800 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMoreProducts}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Load More Products
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="bg-gray-50">
        {/* <Testimonials /> */}
        {/* <Brands /> */}
      </div>

      {/* Trust & Newsletter Section */}
      <div className="bg-white">
        <Policy />
        <Newsletter />
      </div>
    </div>
  );
};

export default Home;