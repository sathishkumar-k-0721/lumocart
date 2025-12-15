import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FiShoppingBag, FiTrendingUp, FiAward, FiHeart, FiTruck, FiShield } from 'react-icons/fi';

export default function Home() {
  const features = [
    {
      icon: FiTruck,
      title: 'Free Shipping',
      description: 'Free shipping on orders over ₹500',
    },
    {
      icon: FiShield,
      title: 'Secure Payment',
      description: 'Safe and secure payment with Razorpay',
    },
    {
      icon: FiAward,
      title: 'Quality Products',
      description: 'Handpicked items with quality guarantee',
    },
    {
      icon: FiHeart,
      title: 'Customer Love',
      description: 'Thousands of happy customers',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 px-4 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
              Welcome to Lumo
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Discover unique gifts for every occasion. Quality products, amazing prices, and exceptional service.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/products">
                <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                  <FiShoppingBag className="mr-2 h-5 w-5" />
                  Shop Now
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" className="bg-blue-800 hover:bg-blue-900">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-4 text-gray-600">
              Find the perfect gift for any occasion
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Birthday Gifts', emoji: '🎂', color: 'from-pink-500 to-rose-500' },
              { name: 'Anniversary', emoji: '💝', color: 'from-red-500 to-pink-500' },
              { name: 'Wedding Gifts', emoji: '💍', color: 'from-purple-500 to-pink-500' },
              { name: 'Corporate', emoji: '💼', color: 'from-blue-500 to-cyan-500' },
            ].map((category, index) => (
              <Link
                key={index}
                href={`/products?category=${category.name.toLowerCase().replace(' ', '-')}`}
                className="group"
              >
                <Card className="overflow-hidden transition-transform hover:scale-105">
                  <div className={`bg-gradient-to-br ${category.color} p-8 text-center`}>
                    <div className="text-6xl">{category.emoji}</div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-center font-semibold text-gray-900 group-hover:text-blue-600">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to Find the Perfect Gift?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Browse our collection and discover something special today
          </p>
          <div className="mt-8">
            <Link href="/products">
              <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                <FiShoppingBag className="mr-2 h-5 w-5" />
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
