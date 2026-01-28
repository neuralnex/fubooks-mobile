export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://bookmate-n9wh.onrender.com',
  timeout: 30000,
};

export const API_ENDPOINTS = {
  register: '/auth/register',
  login: '/auth/login',
  books: '/books',
  bookById: (id: string) => `/books/${id}`,
  orders: '/orders',
  orderById: (id: string) => `/orders/${id}`,
  initiatePayment: '/payments/initiate',
  initiateCashier: '/payments/initiate-cashier',
  paymentStatus: (reference: string) => `/payments/status/${reference}`,
  adminOrders: '/admin/orders',
  adminOrderStatus: (id: string) => `/admin/orders/${id}/status`,
};

