import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { API_CONFIG } from '../config/api';
import type {
  AuthResponse,
  Book,
  Order,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentStatusResponse,
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
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
    const response = await this.api.post<{ data: AuthResponse }>('/auth/register', data);
    return response.data.data;
  }

  async login(emailOrRegNumber: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<{ data: AuthResponse }>('/auth/login', {
      emailOrRegNumber,
      password,
    });
    return response.data.data;
  }

  async getBooks(): Promise<Book[]> {
    const response = await this.api.get<{ data: Book[] }>('/books');
    return response.data.data;
  }

  async getBookById(id: string): Promise<Book> {
    const response = await this.api.get<{ data: Book }>(`/books/${id}`);
    return response.data.data;
  }

  async createOrder(data: {
    items: { bookId: string; quantity: number }[];
    deliveryAddress: string;
  }): Promise<Order> {
    const response = await this.api.post<{ data: Order }>('/orders', data);
    return response.data.data;
  }

  async getOrders(): Promise<Order[]> {
    const response = await this.api.get<{ data: Order[] }>('/orders');
    return response.data.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await this.api.get<{ data: Order }>(`/orders/${id}`);
    return response.data.data;
  }

  async initiatePayment(data: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const response = await this.api.post<{ data: PaymentInitiateResponse }>(
      '/payments/initiate',
      data
    );
    return response.data.data;
  }

  async initiateCashierPayment(orderId: string): Promise<PaymentInitiateResponse> {
    const response = await this.api.post<{ data: PaymentInitiateResponse }>(
      '/payments/initiate-cashier',
      { orderId }
    );
    return response.data.data;
  }

  async getPaymentStatus(reference: string): Promise<PaymentStatusResponse> {
    const response = await this.api.get<{ data: PaymentStatusResponse }>(
      `/payments/status/${reference}`
    );
    return response.data.data;
  }

  async openPaymentUrl(url: string): Promise<void> {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      throw new Error('Cannot open payment URL');
    }
  }
}

export const apiService = new ApiService();

