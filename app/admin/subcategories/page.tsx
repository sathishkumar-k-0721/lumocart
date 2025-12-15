'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  categoryId: string;
  description?: string;
}

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchData();
    if (searchParams.get('action') === 'new') {
      setShowForm(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [subRes, catRes] = await Promise.all([
        fetch('/api/admin/subcategories'),
        fetch('/api/admin/categories'),
      ]);

      if (subRes.ok && catRes.ok) {
        const subData = await subRes.json();
        const catData = await catRes.json();
        setSubcategories(subData);
        setCategories(catData);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Subcategory name is required';
    if (formData.name.trim().length < 2) newErrors.name = 'Subcategory name must be at least 2 characters';
    if (!formData.categoryId) newErrors.categoryId = 'Please select a parent category';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const url = editingId
        ? `/api/admin/subcategories/${editingId}`
        : '/api/admin/subcategories';

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ name: '', description: '', categoryId: '' });
        setErrors({});
        setEditingId(null);
        setShowForm(false);
        fetchData();
        showToast(editingId ? 'Subcategory updated' : 'Subcategory created', 'success');
      } else {
        showToast('Failed to save subcategory', 'error');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      showToast('Error saving subcategory', 'error');
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      categoryId: subcategory.categoryId,
    });
    setEditingId(subcategory._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/subcategories/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchData();
        showToast('Subcategory deleted', 'success');
      } else {
        showToast('Failed to delete subcategory', 'error');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      showToast('Error deleting subcategory', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c._id === categoryId);
    return cat?.name || 'Unknown';
  };

  // Filter subcategories based on search and category filter
  const filteredSubcategories = subcategories.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || sub.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Subcategories</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', description: '', categoryId: '' });
            setErrors({});
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? '✕ Cancel' : '+ Add Subcategory'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Subcategory' : 'Add New Subcategory'}
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
                  placeholder="Subcategory name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Parent Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
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
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Subcategory description"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
            >
              {editingId ? 'Update Subcategory' : 'Create Subcategory'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      {!loading && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="🔍 Search subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg font-semibold">Loading subcategories...</div>
        </div>
      ) : filteredSubcategories.length > 0 ? (
        <div>
          <p className="text-gray-600 mb-4">
            Showing {filteredSubcategories.length} of {subcategories.length} subcategories
          </p>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Parent Category</th>
                  <th className="px-6 py-3 text-left font-semibold">Slug</th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubcategories.map((sub) => (
                  <tr key={sub._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">{sub.name}</td>
                    <td className="px-6 py-3 text-gray-600">{getCategoryName(sub.categoryId)}</td>
                    <td className="px-6 py-3 text-gray-500 text-sm">{sub.slug}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleEdit(sub)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm mr-2 font-semibold"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sub._id, sub.name)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-semibold"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg">
            {searchTerm ? 'No subcategories found matching your search' : 'No subcategories yet'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create first subcategory
            </button>
          )}
        </div>
      )}
    </div>
  );
}
