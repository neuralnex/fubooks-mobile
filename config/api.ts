const base =
  process.env.EXPO_PUBLIC_API_URL != null
    ? String(process.env.EXPO_PUBLIC_API_URL).trim()
    : '';

export const API_CONFIG = {
  /** Set `EXPO_PUBLIC_API_URL` in `mobile/.env` (see `mobile/.env.example`). */
  baseURL: base,
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

