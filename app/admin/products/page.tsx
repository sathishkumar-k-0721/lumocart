'use client';

import { useEffect, useState, useRef } from 'react';

interface Category {
  _id: string;
  name: string;
}

interface Subcategory {
  _id: string;
  name: string;
  categoryId: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  subcategoryId: string;
  isVisible: boolean;
  featured: boolean;
  image: string;
  images?: string[];
  description?: string;
}

export default function ProductsPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    categoryId: '',
    subcategoryId: '',
    image: '',
    isVisible: true,
    featured: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [prodRes, catRes, subRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/subcategories'),
      ]);

      if (prodRes.ok && catRes.ok && subRes.ok) {
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        const subData = await subRes.json();
        setProducts(prodData);
        setCategories(catData);
        setSubcategories(subData);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (formData.name.trim().length < 3) newErrors.name = 'Product name must be at least 3 characters';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';
    if (!formData.categoryId) newErrors.categoryId = 'Please select a category';
    if (!formData.subcategoryId) newErrors.subcategoryId = 'Please select a subcategory';
    if (productImages.length === 0) newErrors.image = 'Please upload at least one product image';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const url = editingId
        ? `/api/admin/products/${editingId}`
        : '/api/admin/products';

      const method = editingId ? 'PUT' : 'POST';

      const productData = {
        ...formData,
        image: productImages[0] || '',
        images: productImages,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        setFormData({
          name: '',
          description: '',
          price: 0,
          originalPrice: 0,
          stock: 0,
          categoryId: '',
          subcategoryId: '',
          image: '',
          isVisible: true,
          featured: false,
        });
        setProductImages([]);
        setErrors({});
        setEditingId(null);
        setShowForm(false);
        fetchData();
        showToast(editingId ? '✅ Product updated successfully!' : '✨ Product created successfully!', 'success');
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.error || 'Failed to save product', 'error');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      showToast('Error saving product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: 0,
      stock: product.stock,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      image: product.image,
      isVisible: product.isVisible,
      featured: product.featured,
    });
    setProductImages(product.images || [product.image]);
    setEditingId(product._id);
    setShowForm(true);
    // Scroll to form using ref
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchData();
        showToast('Product deleted', 'success');
      } else {
        showToast('Failed to delete product', 'error');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      showToast('Error deleting product', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    // Simple toast implementation - you can replace with a proper toast library
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Convert image to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
        
        const base64 = await base64Promise;
        newImages.push(base64);
      }

      setProductImages([...productImages, ...newImages]);
      showToast(`${newImages.length} image(s) uploaded successfully!`, 'success');
    } catch (error) {
      console.error('Failed to upload images:', error);
      showToast('Failed to upload images', 'error');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...productImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setProductImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c._id === categoryId);
    return cat?.name || 'Unknown';
  };

  const getSubcategoryName = (subcategoryId: string) => {
    const sub = subcategories.find((s) => s._id === subcategoryId);
    return sub?.name || 'Unknown';
  };

  const filteredSubcategories = subcategories.filter(
    (sub) => sub.categoryId === formData.categoryId
  );

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVisible = filterVisible === 'all' || 
      (filterVisible === 'visible' && product.isVisible) ||
      (filterVisible === 'hidden' && !product.isVisible);
    const matchesFeatured = filterFeatured === 'all' ||
      (filterFeatured === 'featured' && product.featured) ||
      (filterFeatured === 'regular' && !product.featured);
    
    return matchesSearch && matchesVisible && matchesFeatured;
  });

  return (
    <div className="w-full">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-lg shadow-md border-t-4 border-red-600">
        <div>
          <h1 className="text-4xl font-bold text-red-600">Products Management</h1>
          <p className="text-gray-600 text-sm mt-2">Manage all your product listings</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              description: '',
              price: 0,
              originalPrice: 0,
              stock: 0,
              categoryId: '',
              subcategoryId: '',
              image: '',
              isVisible: true,
              featured: false,
            });
            setProductImages([]);
            setErrors({});
          }}
          className="whitespace-nowrap px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
        >
          <span className="text-2xl">{showForm ? '✕' : '➕'}</span>
          <span>{showForm ? 'Cancel' : 'Add New Product'}</span>
        </button>
      </div>

      {showForm && (
        <div ref={formRef} className="bg-white rounded-lg shadow p-6 mb-6 scroll-mt-20">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Product name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Original Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Stock *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.stock ? 'border-red-500' : ''}`}
                  placeholder="0"
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.categoryId ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Subcategory *</label>
                <select
                  value={formData.subcategoryId}
                  onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                  disabled={!formData.categoryId}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.subcategoryId ? 'border-red-500' : ''} ${!formData.categoryId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Subcategory</option>
                  {filteredSubcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {errors.subcategoryId && <p className="text-red-500 text-sm mt-1">{errors.subcategoryId}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Product description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Product Images *</label>
              <p className="text-xs text-gray-500 mb-3">Upload multiple images. Drag to reorder. First image will be the main image.</p>
              
              {/* Upload Button */}
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg cursor-pointer transition-all ${uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>📁</span>
                  <span>{uploadingImages ? 'Uploading...' : 'Upload Images'}</span>
                </label>
              </div>

              {/* Image Preview Grid with Drag & Drop */}
              {productImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {productImages.map((image, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative group border-2 rounded-lg overflow-hidden cursor-move transition-all ${
                        draggedIndex === index ? 'opacity-50 border-blue-500' : 'border-gray-300 hover:border-red-500'
                      } ${index === 0 ? 'ring-2 ring-green-500' : ''}`}
                    >
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Main Image Badge */}
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                      
                      {/* Image Number */}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs font-bold px-2 py-1 rounded">
                        {index + 1}
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <span className="text-white text-3xl font-bold">×</span>
                      </button>
                      
                      {/* Drag Indicator */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ⇅ Drag
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.image && <p className="text-red-500 text-sm mt-2">{errors.image}</p>}
            </div>

            <div className="flex gap-4 p-4 bg-gray-50 rounded">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm font-semibold">👁️ Visible to Customers</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm font-semibold">⭐ Featured Product</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '⏳ Saving...' : (editingId ? '✅ Update Product' : '✨ Create Product')}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-red-300 hover:border-red-400 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>
            <div>
              <select
                value={filterVisible}
                onChange={(e) => setFilterVisible(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              >
                <option value="all">All Visibility</option>
                <option value="visible">Visible Only</option>
                <option value="hidden">Hidden Only</option>
              </select>
            </div>
            <div>
              <select
                value={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              >
                <option value="all">All Products</option>
                <option value="featured">Featured Only</option>
                <option value="regular">Regular Only</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredProducts.length > 0 ? (
        <div>
          <p className="text-gray-600 mb-4">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-red-300 hover:border-red-600 transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {product.isVisible && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">👁️ Visible</span>
                    )}
                    {product.featured && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">⭐ Featured</span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {getCategoryName(product.categoryId)} → {getSubcategoryName(product.subcategoryId)}
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-600 font-bold text-lg">₹{product.price}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      product.stock > 20 ? 'bg-green-100 text-green-800' :
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} stock
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 px-3 py-2.5 bg-gradient-to-r from-white via-red-50 to-white text-red-600 rounded-lg border-2 border-red-500 hover:border-red-600 hover:from-red-50 hover:via-red-100 hover:to-red-50 text-sm font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      className="flex-1 px-3 py-2.5 bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white rounded-lg hover:from-red-700 hover:via-red-600 hover:to-red-500 text-sm font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg">No products found</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            ➕ Create first product
          </button>
        </div>
      )}
    </div>
  );
}
