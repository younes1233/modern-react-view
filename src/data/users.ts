
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'manager' | 'super_admin';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  sellerId?: string; // For sellers
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  status: 'pending' | 'approved' | 'rejected';
  sellerId?: string;
  sellerName?: string;
  createdAt: string;
  rejectionReason?: string;
}

export const demoUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Super Admin',
    role: 'super_admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    email: 'manager@example.com',
    name: 'Store Manager',
    role: 'manager',
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    lastLogin: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    email: 'seller1@example.com',
    name: 'John Seller',
    role: 'seller',
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
    lastLogin: '2024-01-15T08:45:00Z',
    sellerId: 'seller_001'
  },
  {
    id: '4',
    email: 'seller2@example.com',
    name: 'Jane Vendor',
    role: 'seller',
    isActive: true,
    createdAt: '2024-01-04T00:00:00Z',
    lastLogin: '2024-01-14T16:20:00Z',
    sellerId: 'seller_002'
  },
  {
    id: '5',
    email: 'customer@example.com',
    name: 'Regular Customer',
    role: 'customer',
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
    lastLogin: '2024-01-15T12:00:00Z'
  }
];

export const demoProducts: Product[] = [
  {
    id: 'p1',
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 199.99,
    category: 'Electronics',
    image: '/placeholder.svg',
    status: 'approved',
    sellerId: 'seller_001',
    sellerName: 'John Seller',
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 'p2',
    name: 'Smart Watch',
    description: 'Fitness tracking smartwatch with heart rate monitor',
    price: 299.99,
    category: 'Electronics',
    image: '/placeholder.svg',
    status: 'pending',
    sellerId: 'seller_001',
    sellerName: 'John Seller',
    createdAt: '2024-01-14T00:00:00Z'
  },
  {
    id: 'p3',
    name: 'Organic Coffee Beans',
    description: 'Premium organic coffee beans from sustainable farms',
    price: 24.99,
    category: 'Food & Beverages',
    image: '/placeholder.svg',
    status: 'pending',
    sellerId: 'seller_002',
    sellerName: 'Jane Vendor',
    createdAt: '2024-01-13T00:00:00Z'
  },
  {
    id: 'p4',
    name: 'Yoga Mat',
    description: 'Non-slip premium yoga mat for all types of workouts',
    price: 49.99,
    category: 'Sports & Fitness',
    image: '/placeholder.svg',
    status: 'rejected',
    sellerId: 'seller_002',
    sellerName: 'Jane Vendor',
    createdAt: '2024-01-12T00:00:00Z',
    rejectionReason: 'Product description needs more details about materials and dimensions'
  }
];

export const rolePermissions = {
  customer: [],
  seller: ['products:create', 'products:view_own'],
  manager: ['products:view', 'products:update', 'orders:view', 'orders:update', 'categories:view'],
  super_admin: ['*'] // All permissions
};
