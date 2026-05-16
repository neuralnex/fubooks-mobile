import { resolveApiBaseUrl } from '../utils/resolveApiBaseUrl';

export const API_CONFIG = {
  baseURL: resolveApiBaseUrl(),
  timeout: 45000,
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
