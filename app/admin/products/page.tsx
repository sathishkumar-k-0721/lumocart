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
  description?: string;
}

export default function ProductsPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
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
    if (!formData.image.trim()) newErrors.image = 'Product image URL is required';

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

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Product name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Price (£) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Original Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Stock *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.stock ? 'border-red-500' : ''}`}
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
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.categoryId ? 'border-red-500' : ''}`}
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
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.subcategoryId ? 'border-red-500' : ''} ${!formData.categoryId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Product description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Image URL *</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.image ? 'border-red-500' : ''}`}
                placeholder="https://..."
              />
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
              {formData.image && (
                <div className="mt-2">
                  <img src={formData.image} alt="Preview" className="h-32 w-32 object-cover rounded border" />
                </div>
              )}
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
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filterVisible}
                onChange={(e) => setFilterVisible(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
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
                    <span className="text-green-600 font-bold text-lg">£{product.price}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      product.stock > 20 ? 'bg-green-100 text-green-800' :
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} stock
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-semibold"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      className="flex-1 px-3 py-2 bg-red-700 text-white rounded hover:bg-red-800 text-sm font-semibold"
                    >
                      🗑️ Delete
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
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create first product
          </button>
        </div>
      )}
    </div>
  );
}
