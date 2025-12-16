'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductModal } from '@/components/product-modal';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  images?: string[];
  description: string;
  categoryId: string;
  subcategoryId: string;
  category?: any;
  subcategory?: any;
}

export function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const categoryId = searchParams.get('category');
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [searchParams]);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, selectedSubcategory]);

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
        const visibleProducts = prodData.filter((p: any) => p.isVisible);
        setProducts(visibleProducts);
        setCategories(catData);
        setSubcategories(subData);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }
    
    if (selectedSubcategory) {
      filtered = filtered.filter((p) => p.subcategoryId === selectedSubcategory);
    }
    
    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
  };

  const filteredSubcategories = selectedCategory
    ? subcategories.filter((sub) => sub.categoryId === selectedCategory)
    : [];

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c._id === categoryId);
    return cat?.name || 'Unknown';
  };

  const getSubcategoryName = (subcategoryId: string) => {
    const sub = subcategories.find((s) => s._id === subcategoryId);
    return sub?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      <div className="max-w-full mx-auto px-14 md:px-20 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Filter Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Subcategory</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                disabled={!selectedCategory}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Subcategories</option>
                {filteredSubcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(selectedCategory || selectedSubcategory) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
              {selectedCategory && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold flex items-center gap-2">
                  {getCategoryName(selectedCategory)}
                  <button
                    onClick={() => handleCategoryChange('')}
                    className="hover:text-red-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedSubcategory && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold flex items-center gap-2">
                  {getSubcategoryName(selectedSubcategory)}
                  <button
                    onClick={() => handleSubcategoryChange('')}
                    className="hover:text-red-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-200"></div>
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div>
              <p className="text-gray-600 mb-6 text-lg">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => {
                      setSelectedProduct({
                        id: product._id,
                        name: product.name,
                        slug: product.slug,
                        description: product.description,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        image: product.image,
                        images: product.images,
                        stock: product.stock,
                        category: product.category,
                        subcategory: product.subcategory,
                      });
                      setIsModalOpen(true);
                    }}
                    className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-red-500 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="relative overflow-hidden h-40 bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm mb-2 group-hover:text-red-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 font-bold text-base">₹{product.originalPrice || product.price}</span>
                          {product.originalPrice && (
                            <span className="text-gray-400 text-xs line-through">₹{product.price}</span>
                          )}
                        </div>
                        {product.originalPrice && product.originalPrice < product.price && (
                          <span className="text-red-600 font-bold text-sm">
                            {Math.round(((product.price - product.originalPrice) / product.price) * 100)}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-lg">No products found</p>
              {(selectedCategory || selectedSubcategory) && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                  }}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
