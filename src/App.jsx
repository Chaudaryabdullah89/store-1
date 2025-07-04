import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './Context/AuthContext';
import ShopContextProvider from './Context/shopcontext';
import { ToastContainer } from 'react-toastify';

// Components
import Footer from './Components/Fotter';
import Navbar from './Components/navbar';
import Search from './Components/Search';
import Preloader from './Components/Preloader';
import AdminLayout from './Components/AdminLayout';

// Pages
import About from './Pages/About';
import Cart from './Pages/cart';
import Collection from './Pages/Collection';
import Contact from './Pages/Contact';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Order from './Pages/order';
import PlaceOrder from './Pages/PlaceOrder';
import Product from './Pages/Product';
import Register from './Pages/register';
import OrderConfirmation from './Pages/OrderConfirmation';
import AdminLogin from './Pages/AdminLogin';
import Orders from './Pages/Orders';
import Profile from './Pages/Profile';
import AddProduct from './Pages/admin/AddProduct';
import EditProduct from './Pages/admin/EditProduct';
import RequestReset from './Pages/RequestReset';
import ResetPassword from './Pages/ResetPassword';
import AuthSuccess from './Pages/admin/AuthSuccess';
import BlogList from './Pages/BlogList';
import BlogDetail from './Pages/BlogDetail';
import WriteBlog from './Pages/WriteBlog';
import OrderDetails from './Pages/admin/OrderDetails';
import PaymentConfirmation from './Pages/PaymentConfirmation';
 
// Admin Pages
import AdminDashboard from './Pages/admin/AdminDashboard';
import AdminOrders from './Pages/admin/AdminOrders';
import AdminProducts from './Pages/admin/AdminProducts';
import AdminCustomers from './Pages/admin/AdminCustomers';
import AdminSettings from './Pages/admin/AdminSettings';
import AdminBlogs from './Pages/admin/AdminBlogs';
import AddBlog from './Pages/admin/AddBlog';
import Discounts from './Pages/admin/Discounts';

// Initialize Stripe
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

function App() {
  const location = useLocation();

  React.useEffect(() => {
    const pageTitles = {
      '/': 'Home - E-commerce App',
      '/about': 'About Us - E-commerce App',
      '/contact': 'Contact Us - E-commerce App',
      '/product/:productid': 'Product Details - E-commerce App',
      '/cart': 'Your Cart - E-commerce App',
      '/placeorder': 'Place Order - E-commerce App',
      '/login': 'Login - E-commerce App',
      '/register': 'Register - E-commerce App',
      '/order': 'Your Orders - E-commerce App',
      '/collection': 'Collection - E-commerce App',
    };

    const title = pageTitles[location.pathname] || 'E-commerce App';
    document.title = title;
  }, [location]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ShopContextProvider>
          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <Preloader />
              <div className='max-w-[1280px] mx-auto'>
                <Navbar />
              </div>
              <Search />
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path='/' element={<Home />} />
                  <Route path='/about' element={<About />} />
                  <Route path='/contact' element={<Contact />} />
                  <Route path='/product/:productid' element={<Product />} />
                  <Route path='/cart' element={<Cart />} />
                  <Route path='/placeorder' element={<PlaceOrder />} />
                  <Route path='/login' element={<Login />} />
                  <Route path='/register' element={<Register />} />
                  <Route path='/order' element={<Order />} />
                  <Route path='/collection' element={<Collection />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/place-order" element={<PlaceOrder />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  
                  {/* Protected Admin Routes */}
                  <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminLayout><AdminProducts /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/add-product" element={<ProtectedRoute requireAdmin><AdminLayout><AddProduct /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/edit-product/:id" element={<ProtectedRoute requireAdmin><AdminLayout><EditProduct /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/customers" element={<ProtectedRoute requireAdmin><AdminLayout><AdminCustomers /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/blogs" element={<ProtectedRoute requireAdmin><AdminLayout><AdminBlogs /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/add-blog" element={<ProtectedRoute requireAdmin><AdminLayout><AddBlog /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/edit-blog/:id" element={<ProtectedRoute requireAdmin><AdminLayout><AddBlog /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/orders/:orderId" element={<ProtectedRoute requireAdmin><AdminLayout><OrderDetails /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/discounts" element={<ProtectedRoute requireAdmin><AdminLayout><Discounts /></AdminLayout></ProtectedRoute>} />
                  
                  <Route path="/product" element={<Product />}>
                    <Route path=':productId' element={<Product />} />
                  </Route>
                  <Route path='/orders' element={<Orders />} />
                  <Route path="/order/:orderId" element={<OrderConfirmation />} />
                  <Route path="/request-reset" element={<RequestReset />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/auth-success" element={<AuthSuccess />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/write-blog" element={<WriteBlog />} />
                  <Route path="/forgot-password" element={<RequestReset />} />
                  <Route path="/payment-confirmation/:orderId" element={<PaymentConfirmation />} />
                  <Route path="*" element={<div className='text-center text-2xl'>404 Not Found</div>} />
                </Routes>
              </AnimatePresence>
              <Footer />
            </Elements>
          ) : (
            <>
              <Preloader />
              <div className='max-w-[1280px] mx-auto'>
                <Navbar />
              </div>
              <Search />
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path='/' element={<Home />} />
                  <Route path='/about' element={<About />} />
                  <Route path='/contact' element={<Contact />} />
                  <Route path='/product/:productid' element={<Product />} />
                  <Route path='/cart' element={<Cart />} />
                  <Route path='/placeorder' element={<PlaceOrder />} />
                  <Route path='/login' element={<Login />} />
                  <Route path='/register' element={<Register />} />
                  <Route path='/order' element={<Order />} />
                  <Route path='/collection' element={<Collection />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/place-order" element={<PlaceOrder />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  
                  {/* Protected Admin Routes */}
                  <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminLayout><AdminProducts /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/add-product" element={<ProtectedRoute requireAdmin><AdminLayout><AddProduct /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/edit-product/:id" element={<ProtectedRoute requireAdmin><AdminLayout><EditProduct /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/customers" element={<ProtectedRoute requireAdmin><AdminLayout><AdminCustomers /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/blogs" element={<ProtectedRoute requireAdmin><AdminLayout><AdminBlogs /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/add-blog" element={<ProtectedRoute requireAdmin><AdminLayout><AddBlog /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/edit-blog/:id" element={<ProtectedRoute requireAdmin><AdminLayout><AddBlog /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/orders/:orderId" element={<ProtectedRoute requireAdmin><AdminLayout><OrderDetails /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/discounts" element={<ProtectedRoute requireAdmin><AdminLayout><Discounts /></AdminLayout></ProtectedRoute>} />
                  
                  <Route path="/product" element={<Product />}>
                    <Route path=':productId' element={<Product />} />
                  </Route>
                  <Route path='/orders' element={<Orders />} />
                  <Route path="/order/:orderId" element={<OrderConfirmation />} />
                  <Route path="/request-reset" element={<RequestReset />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/auth-success" element={<AuthSuccess />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/write-blog" element={<WriteBlog />} />
                  <Route path="/forgot-password" element={<RequestReset />} />
                  <Route path="/payment-confirmation/:orderId" element={<PaymentConfirmation />} />
                  <Route path="*" element={<div className='text-center text-2xl'>404 Not Found</div>} />
                </Routes>
              </AnimatePresence>
              <Footer />
            </>
          )}
        </ShopContextProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
