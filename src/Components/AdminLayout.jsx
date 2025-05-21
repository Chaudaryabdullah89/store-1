import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiShoppingBag, 
  FiUsers, 
  FiSettings, 
  FiLogOut,
  FiFileText,
  FiShoppingCart
} from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
    { name: 'Orders', href: '/admin/orders', icon: FiShoppingCart },
    { name: 'Products', href: '/admin/products', icon: FiShoppingBag },
    { name: 'Customers', href: '/admin/customers', icon: FiUsers },
    { name: 'Blogs', href: '/admin/blogs', icon: FiFileText },
    { name: 'Settings', href: '/admin/settings', icon: FiSettings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-100"
    >
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center h-16 border-b"
          >
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Logout Button */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="p-4 border-t"
          >
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <FiLogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pl-64"
      >
        <main className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </motion.div>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default AdminLayout; 