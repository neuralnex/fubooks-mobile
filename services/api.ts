import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { API_CONFIG } from '../config/api';
import type {
  AuthResponse,
  Book,
  Order,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentGatewayStatus,
} from '../types';

/** Backend `sendSuccess` shape: `{ success, message, data }`. */
function unwrapApiData<T>(response: AxiosResponse<unknown>, context: string): T {
  const body = response.data;
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    (body as { data: unknown }).data !== undefined
  ) {
    return (body as { data: T }).data;
  }
  throw new Error(
    `Unexpected response for ${context}. Update the app or contact support if this continues.`
  );
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );
  }

  async register(data: {
    name: string;
    email: string;
    regNumber: string;
    password: string;
    accommodation: string;
  }): Promise<AuthResponse> {
    const response = await this.api.post<unknown>('/auth/register', data);
    return unwrapApiData<AuthResponse>(response, 'register');
  }

  async login(emailOrRegNumber: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<unknown>('/auth/login', {
      emailOrRegNumber,
      password,
    });
    return unwrapApiData<AuthResponse>(response, 'login');
  }

  async getBooks(): Promise<Book[]> {
    const response = await this.api.get<unknown>('/books');
    return unwrapApiData<Book[]>(response, 'books');
  }

  async getBookById(id: string): Promise<Book> {
    const response = await this.api.get<unknown>(`/books/${id}`);
    return unwrapApiData<Book>(response, 'book');
  }

  async createOrder(data: {
    items: { bookId: string; quantity: number }[];
    deliveryAddress: string;
    deliveryMethod: 'pickup' | 'delivery';
  }): Promise<Order> {
    const response = await this.api.post<unknown>('/orders', data);
    return unwrapApiData<Order>(response, 'order');
  }

  async getOrders(): Promise<Order[]> {
    const response = await this.api.get<unknown>('/orders');
    return unwrapApiData<Order[]>(response, 'orders');
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await this.api.get<unknown>(`/orders/${id}`);
    return unwrapApiData<Order>(response, 'order');
  }

  async initiatePayment(data: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const response = await this.api.post<unknown>('/payments/initiate', data);
    return unwrapApiData<PaymentInitiateResponse>(response, 'payment');
  }

  async initiateCashierPayment(orderId: string): Promise<PaymentInitiateResponse> {
    const response = await this.api.post<unknown>('/payments/initiate-cashier', { orderId });
    return unwrapApiData<PaymentInitiateResponse>(response, 'cashier payment');
  }

  async getPaymentStatus(reference: string): Promise<PaymentGatewayStatus> {
    const encoded = encodeURIComponent(reference);
    const response = await this.api.get<unknown>(`/payments/status/${encoded}`);
    return unwrapApiData<PaymentGatewayStatus>(response, 'payment status');
  }

  async openPaymentUrl(url: string): Promise<string | undefined> {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      throw new Error('Cannot open payment URL');
    }

    const result = await WebBrowser.openAuthSessionAsync(url, Linking.createURL('/'));
    if (result.type === 'success') {
      return result.url;
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return undefined;
    }

    await Linking.openURL(url);
    return undefined;
  }

  async cancelOrder(id: string): Promise<Order> {
    const response = await this.api.delete<unknown>(`/orders/${id}`);
    return unwrapApiData<Order>(response, 'cancel order');
  }

  async getBooksPaginated(page: number = 1, limit: number = 20, filters: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<{
    books: Book[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await this.api.get<unknown>('/books', { params: { page, limit, ...filters } });
    return unwrapApiData<{
      books: Book[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(response, 'paginated books');
  }

  async getOrdersPaginated(page: number = 1, limit: number = 20, filters: {
    status?: string;
    paymentStatus?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await this.api.get<unknown>('/orders', { params: { page, limit, ...filters } });
    return unwrapApiData<{
      orders: Order[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(response, 'paginated orders');
  }
}

export const apiService = new ApiService();
