import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            🎁 Lumo
          </h1>
          <p className="text-2xl text-gray-600 mb-2">
            Next.js Migration - Phase 1 Complete! 🚀
          </p>
          <p className="text-lg text-gray-500">
            Modern E-Commerce Platform with TypeScript, Tailwind CSS & Prisma
          </p>
        </div>

        {/* Success Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Next.js 16</h3>
            <p className="text-gray-600">App Router with TypeScript and modern React features</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Tailwind CSS</h3>
            <p className="text-gray-600">Utility-first CSS framework for rapid UI development</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💾</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Prisma + MongoDB</h3>
            <p className="text-gray-600">Type-safe database ORM with your existing data</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">NextAuth.js</h3>
            <p className="text-gray-600">Ready for authentication implementation</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Razorpay</h3>
            <p className="text-gray-600">Payment gateway integration ready</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mobile Ready</h3>
            <p className="text-gray-600">Code reusable for React Native & PWA</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🎯 Next Steps</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Phase 0-1: Setup Complete!</h4>
                <p className="text-gray-600">Project initialized with all dependencies</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                2
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Phase 2: Database Migration</h4>
                <p className="text-gray-600">Migrate existing data from old MongoDB to Prisma schema</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                3
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Phase 3: Backend API Migration</h4>
                <p className="text-gray-600">Build Next.js API routes for products, orders, cart, auth</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                4
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Phase 4: Frontend Components</h4>
                <p className="text-gray-600">Build React components for shop and admin pages</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              href="/api/test" 
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Test API Connection →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="text-sm">
            Migration started: December 14, 2025 | Timeline: 8-10 weeks
          </p>
          <p className="text-xs mt-2">
            Old server running on: http://localhost:5000 | New server: http://localhost:3000
          </p>
        </div>
      </div>
    </div>
  )
}
