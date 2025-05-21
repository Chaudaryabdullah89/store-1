import { useState, useEffect } from 'react';
import AdminLayout from '../../Components/AdminLayout';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { FiMail, FiSend, FiX } from 'react-icons/fi';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    template: 'custom'
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/users');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!Array.isArray(customers)) {
      setFilteredCustomers([]);
      return;
    }

    let result = [...customers];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(customer =>
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc'
          ? (a.name || '').localeCompare(b.name || '')
          : (b.name || '').localeCompare(a.name || '');
      }
      if (sortConfig.key === 'orderCount') {
        return sortConfig.direction === 'asc'
          ? (a.orderCount || 0) - (b.orderCount || 0)
          : (b.orderCount || 0) - (a.orderCount || 0);
      }
      if (sortConfig.key === 'totalSpent') {
        return sortConfig.direction === 'asc'
          ? (a.totalSpent || 0) - (b.totalSpent || 0)
          : (b.totalSpent || 0) - (a.totalSpent || 0);
      }
      return 0;
    });

    setFilteredCustomers(result);
  }, [customers, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/api/users/${customerId}`);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast.error(error.response?.data?.message || 'Failed to delete customer');
      }
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/send-email', {
        to: selectedCustomer.email,
        subject: emailData.subject,
        message: emailData.message,
        template: emailData.template
      });
      toast.success('Email sent successfully');
      setShowEmailModal(false);
      setEmailData({ subject: '', message: '', template: 'custom' });
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    }
  };

  const CustomerDetails = ({ customer }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Customer Details</h2>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Customer Information</h3>
              <p className="text-sm text-gray-600">Name: {customer.name}</p>
              <p className="text-sm text-gray-600">Email: {customer.email}</p>
              <p className="text-sm text-gray-600">Phone: {customer.phone}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Address</h3>
              <p className="text-sm text-gray-600">{customer.address}</p>
              <p className="text-sm text-gray-600">{customer.city}, {customer.state} {customer.zipCode}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Order Summary</h3>
              <p className="text-sm text-gray-600">Total Orders: {customer.orderCount}</p>
              <p className="text-sm text-gray-600">Total Spent: ${customer.totalSpent.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Last Order: {customer.lastOrder}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const EmailModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Send Email to {selectedCustomer?.name}</h2>
          <button
            onClick={() => setShowEmailModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={emailData.message}
              onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowEmailModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
            >
              <FiSend className="mr-2" />
              Send Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  CustomerDetails.propTypes = {
    customer: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      zipCode: PropTypes.string.isRequired,
      orderCount: PropTypes.number.isRequired,
      totalSpent: PropTypes.number.isRequired,
      lastOrder: PropTypes.string.isRequired,
    }).isRequired,
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700">Search Customers</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('orderCount')}
                  >
                    Orders {sortConfig.key === 'orderCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('totalSpent')}
                  >
                    Total Spent {sortConfig.key === 'totalSpent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.orderCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(customer.totalSpent || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowEmailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <FiMail className="mr-1" />
                        Send Email
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer._id)}
                        className="text-red-600 hover:text-red-900 ml-2"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedCustomer && <CustomerDetails customer={selectedCustomer} />}
      {showEmailModal && <EmailModal />}
    </AdminLayout>
  );
};

export default AdminCustomers; 