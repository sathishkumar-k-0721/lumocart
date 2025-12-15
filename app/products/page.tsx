'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image: string;
  categoryId: string;
  subcategoryId: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const categoryId = searchParams.get('category');
    if (categoryId) {
      setSelectedCategory(categoryId);
      setFilteredProducts(products.filter((p) => p.categoryId === categoryId));
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchParams]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
      ]);

      if (prodRes.ok && catRes.ok) {
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        const visibleProducts = prodData.filter((p: any) => p.isVisible);
        setProducts(visibleProducts);
        setCategories(catData);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (!categoryId) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.categoryId === categoryId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Our Products</h1>
          <p className="text-gray-600">Discover our premium collection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-lg font-bold mb-4">Filters</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Category</h3>
              <button
                onClick={() => handleCategoryChange('')}
                className={`block w-full text-left p-2 rounded mb-2 ${
                  !selectedCategory ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat._id)}
                  className={`block w-full text-left p-2 rounded mb-2 ${
                    selectedCategory === cat._id
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-lg font-semibold">Loading...</div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-4">Showing {filteredProducts.length} products</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product._id}
                      href={`/products/${product.slug}`}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden group"
                    >
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-green-600 font-bold text-xl">₹{product.price}</span>
                          <span className={`text-sm px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
