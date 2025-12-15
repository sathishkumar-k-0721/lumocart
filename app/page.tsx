import { MongoClient } from 'mongodb';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

async function getProducts() {
  const client = new MongoClient(process.env.DATABASE_URL!);
  await client.connect();
  const db = client.db('lumocart');
  const products = await db
    .collection('products')
    .find({ isVisible: true, featured: true })
    .limit(8)
    .toArray();
  await client.close();
  return products;
}

async function getCategories() {
  const client = new MongoClient(process.env.DATABASE_URL!);
  await client.connect();
  const db = client.db('lumocart');
  const categories = await db.collection('categories').find({}).toArray();
  await client.close();
  return categories;
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Hidden for admin users */}
      {user?.role !== 'ADMIN' && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-5xl font-bold mb-4">Welcome to Lumo</h1>
            <p className="text-xl mb-8">Premium gifts for every occasion</p>
            <Link href="/products" className="inline-block px-8 py-3 bg-white text-purple-600 rounded font-bold hover:bg-gray-100 transition">
              Shop Now →
            </Link>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category: any) => (
            <Link
              key={(category as any)._id}
              href={`/products?category=${(category as any)._id}`}
              className="group overflow-hidden rounded-lg shadow hover:shadow-lg transition-all"
            >
              <img
                src={(category as any).image}
                alt={(category as any).name}
                className="w-full h-40 object-cover group-hover:scale-105 transition"
              />
              <div className="p-4 bg-gray-50 group-hover:bg-gray-100 transition">
                <h3 className="font-bold text-lg">{(category as any).name}</h3>
                <p className="text-gray-600 text-sm">{(category as any).description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-6xl mx-auto px-4 py-12 bg-gray-50">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Link
              key={(product as any)._id}
              href={`/products/${(product as any).slug}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden group"
            >
              <div className="relative overflow-hidden h-48">
                <img
                  src={(product as any).image}
                  alt={(product as any).name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600">{(product as any).name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-bold text-xl">₹{(product as any).price}</span>
                  <span className="text-gray-500 text-sm">Stock: {(product as any).stock}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find the Perfect Gift?</h2>
          <Link href="/products" className="inline-block px-8 py-3 bg-white text-purple-600 rounded font-bold hover:bg-gray-100 transition">
            Browse All Products
          </Link>
        </div>
      </div>
    </div>
  );
}
