// User types
export interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

// Product types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  categoryId: string
  category?: Category
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

// Category types
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    products: number
  }
}

// Cart types
export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  product: Product
  quantity: number
  price: number
  createdAt: Date
  updatedAt: Date
}

// Order types
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user?: User
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentId?: string
  razorpayOrderId?: string
  shippingAddress: Address
  billingAddress: Address
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  price: number
  createdAt: Date
  updatedAt: Date
}

// Address type
export interface Address {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
