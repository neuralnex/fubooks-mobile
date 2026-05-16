import Constants from 'expo-constants';

/**
 * API origin for Axios. Resolved in order:
 * 1. `EXPO_PUBLIC_API_URL` — inlined when Metro/EAS bundles (local `.env`: no spaces around `=`).
 * 2. `expo.extra.apiUrl` — always shipped in standalone APKs/IPAs (see `app.json`).
 */
const fromEnv =
  process.env.EXPO_PUBLIC_API_URL != null
    ? String(process.env.EXPO_PUBLIC_API_URL).trim()
    : '';
const fromExtraRaw = Constants.expoConfig?.extra?.apiUrl;
const fromExtra =
  fromExtraRaw != null && typeof fromExtraRaw === 'string' ? fromExtraRaw.trim() : '';

const base = fromEnv || fromExtra;

export const API_CONFIG = {
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

