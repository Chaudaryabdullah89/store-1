import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../Components/AdminLayout';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import { FiUpload, FiX, FiSave } from 'react-icons/fi';

const AddProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: '',
    subCategory: '',
    sizes: [],
    brand: '',
    bestseller: false,
    images: [],
    shipping: {
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      },
      freeShipping: false,
      shippingClass: 'standard' // standard, express, overnight
    },
    specifications: {
      material: '',
      color: '',
      care: '',
      origin: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    }
  });

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (files && name === 'images') {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        [name]: [...prev.images, ...newFiles]
      }));
      
      // Create preview URLs
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImages(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    } else if (type === 'checkbox') {
      if (name === 'freeShipping') {
        setFormData(prev => ({
          ...prev,
          shipping: {
            ...prev.shipping,
            freeShipping: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'shipping' && child === 'dimensions') {
        const [dimension, field] = value.split('.');
        setFormData(prev => ({
          ...prev,
          shipping: {
            ...prev.shipping,
            dimensions: {
              ...prev.shipping.dimensions,
              [dimension]: field
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSizeChange = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, upload the image
      const imageFile = formData.images[0];
      const imageFormData = new FormData();
      imageFormData.append('image', imageFile);

      const uploadResponse = await api.post('/api/upload', imageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Then create the product with all details
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        category: formData.category,
        subCategory: formData.subCategory,
        stock: parseInt(formData.stock),
        brand: formData.brand,
        bestseller: formData.bestseller,
        sizes: formData.sizes,
        image: uploadResponse.data.url,
        shipping: {
          ...formData.shipping,
          weight: parseFloat(formData.shipping.weight),
          dimensions: {
            length: parseFloat(formData.shipping.dimensions.length),
            width: parseFloat(formData.shipping.dimensions.width),
            height: parseFloat(formData.shipping.dimensions.height)
          }
        },
        specifications: formData.specifications,
        seo: formData.seo
      };

      await api.post('/api/products', productData);

      toast.success('Product added successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
              <h1 className="text-2xl font-bold text-white">Add New Product</h1>
              <p className="mt-1 text-sm text-blue-100">Fill in the details below to add a new product to your store</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Product Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                      Brand
                    </label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter product description"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Regular Price
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700">
                      Discount Price (Optional)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="discountPrice"
                        name="discountPrice"
                        value={formData.discountPrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="shipping.weight" className="block text-sm font-medium text-gray-700">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      id="shipping.weight"
                      name="shipping.weight"
                      value={formData.shipping.weight}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="shipping.shippingClass" className="block text-sm font-medium text-gray-700">
                      Shipping Class
                    </label>
                    <select
                      id="shipping.shippingClass"
                      name="shipping.shippingClass"
                      value={formData.shipping.shippingClass}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="standard">Standard Shipping</option>
                      <option value="express">Express Shipping</option>
                      <option value="overnight">Overnight Shipping</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="freeShipping"
                        name="freeShipping"
                        checked={formData.shipping.freeShipping}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="freeShipping" className="ml-2 block text-sm text-gray-900">
                        Free Shipping
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Dimensions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="shipping.dimensions.length" className="block text-sm font-medium text-gray-700">
                        Length (cm)
                      </label>
                      <input
                        type="number"
                        id="shipping.dimensions.length"
                        name="shipping.dimensions.length"
                        value={formData.shipping.dimensions.length}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping.dimensions.width" className="block text-sm font-medium text-gray-700">
                        Width (cm)
                      </label>
                      <input
                        type="number"
                        id="shipping.dimensions.width"
                        name="shipping.dimensions.width"
                        value={formData.shipping.dimensions.width}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping.dimensions.height" className="block text-sm font-medium text-gray-700">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        id="shipping.dimensions.height"
                        name="shipping.dimensions.height"
                        value={formData.shipping.dimensions.height}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Product Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="specifications.material" className="block text-sm font-medium text-gray-700">
                      Material
                    </label>
                    <input
                      type="text"
                      id="specifications.material"
                      name="specifications.material"
                      value={formData.specifications.material}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter material"
                    />
                  </div>

                  <div>
                    <label htmlFor="specifications.color" className="block text-sm font-medium text-gray-700">
                      Color
                    </label>
                    <input
                      type="text"
                      id="specifications.color"
                      name="specifications.color"
                      value={formData.specifications.color}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter color"
                    />
                  </div>

                  <div>
                    <label htmlFor="specifications.care" className="block text-sm font-medium text-gray-700">
                      Care Instructions
                    </label>
                    <input
                      type="text"
                      id="specifications.care"
                      name="specifications.care"
                      value={formData.specifications.care}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter care instructions"
                    />
                  </div>

                  <div>
                    <label htmlFor="specifications.origin" className="block text-sm font-medium text-gray-700">
                      Country of Origin
                    </label>
                    <input
                      type="text"
                      id="specifications.origin"
                      name="specifications.origin"
                      value={formData.specifications.origin}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter country of origin"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">SEO Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="seo.metaTitle" className="block text-sm font-medium text-gray-700">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      id="seo.metaTitle"
                      name="seo.metaTitle"
                      value={formData.seo.metaTitle}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter meta title"
                    />
                  </div>

                  <div>
                    <label htmlFor="seo.metaDescription" className="block text-sm font-medium text-gray-700">
                      Meta Description
                    </label>
                    <textarea
                      id="seo.metaDescription"
                      name="seo.metaDescription"
                      value={formData.seo.metaDescription}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter meta description"
                    />
                  </div>

                  <div>
                    <label htmlFor="seo.keywords" className="block text-sm font-medium text-gray-700">
                      Keywords
                    </label>
                    <input
                      type="text"
                      id="seo.keywords"
                      name="seo.keywords"
                      value={formData.seo.keywords}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter keywords (comma-separated)"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2 h-4 w-4" />
                      Save Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddProduct; 