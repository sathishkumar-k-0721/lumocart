'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchCategories();
    if (searchParams.get('action') === 'new') {
      setShowForm(true);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    if (formData.name.trim().length < 2) newErrors.name = 'Category name must be at least 2 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.image.trim()) newErrors.image = 'Category image URL is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : '/api/admin/categories';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ name: '', description: '', image: '' });
        setErrors({});
        setEditingId(null);
        setShowForm(false);
        fetchCategories();
        showToast(editingId ? 'Category updated' : 'Category created', 'success');
      } else {
        showToast('Failed to save category', 'error');
      }
    } catch (error) {
      console.error('Failed to save category:', error);
      showToast('Error saving category', 'error');
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image,
    });
    setEditingId(category._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? All associated products will remain but lose their category reference.`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchCategories();
        showToast('Category deleted', 'success');
      } else {
        showToast('Failed to delete category', 'error');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      showToast('Error deleting category', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-lg shadow-md border-t-4 border-red-600">
        <div>
          <h1 className="text-4xl font-bold text-red-600">Categories Management</h1>
          <p className="text-gray-600 text-sm mt-2">Manage product categories</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', description: '', image: '' });
            setErrors({});
          }}
          className="whitespace-nowrap px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
        >
          ➕ Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-red-600">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Category name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Category description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
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
                  <img src={formData.image} alt="Preview" className="h-32 w-full object-cover rounded border" />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: '', description: '', image: '' });
                  setErrors({});
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-white via-red-50 to-white text-red-600 rounded-lg border-2 border-red-500 hover:border-red-600 hover:from-red-50 hover:via-red-100 hover:to-red-50 font-semibold shadow hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white rounded-lg hover:from-red-700 hover:via-red-600 hover:to-red-500 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                {editingId ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 mb-6 border border-gray-200 hover:border-red-500 transition-all">
          <input
            type="text"
            placeholder="🔍 Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg font-semibold">Loading categories...</div>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div>
          <p className="text-gray-600 mb-6 text-lg">
            Showing {filteredCategories.length} of {categories.length} categories
          </p>
          <div className="grid grid-cols-4 gap-4">
            {filteredCategories.map((category) => (
              <div key={category._id} className="bg-white rounded-xl shadow-md hover:shadow-2xl overflow-hidden border border-gray-200 hover:border-red-500 transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="h-40 overflow-hidden bg-gradient-to-br from-red-50 to-red-100">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold mb-1 text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2 min-h-[2.5rem]">{category.name}</h3>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">{category.description}</p>
                  <p className="text-xs text-gray-400 mb-3 font-mono bg-gray-50 px-2 py-1 rounded truncate">/{category.slug}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 px-2 py-2 bg-gradient-to-r from-white via-red-50 to-white text-red-600 font-semibold rounded-lg border-2 border-red-500 hover:border-red-600 hover:from-red-50 hover:via-red-100 hover:to-red-50 text-xs shadow hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id, category.name)}
                      className="flex-1 px-2 py-2 bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white font-semibold rounded-lg hover:from-red-700 hover:via-red-600 hover:to-red-500 text-xs shadow hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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
          <p className="text-gray-600 text-lg">
            {searchTerm ? 'No categories found matching your search' : 'No categories yet'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              ➕ Create First Category
            </button>
          )}
        </div>
      )}
    </div>
  );
}
