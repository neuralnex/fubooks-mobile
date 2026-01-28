export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  regNumber: string;
  role: UserRole;
  accommodation?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type BookCategory = 'Textbook' | 'Manual' | 'Guide' | 'Past Paper';

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  category: BookCategory;
  classFormLevel?: string;
  stock: number;
  coverImage?: string;
  createdById: string;
  createdAt: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'failed';
export type OrderStatus = 'processing' | 'purchased' | 'delivering' | 'delivered';

export interface OrderItem {
  id: string;
  bookId: string;
  book: Book;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  studentId: string;
  student?: User;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryAddress: string;
  paymentReference?: string;
  opayOrderNo?: string;
  orderItems: OrderItem[];
  createdAt: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface PaymentInitiateRequest {
  orderId: string;
  payMethod: 'AccountPayment' | 'BankCard' | 'BankAccount';
  bankAccount?: string;
  bankCode?: string;
}

export interface PaymentInitiateResponse {
  reference: string;
  paymentUrl?: string;
  cashierUrl?: string;
}

export interface PaymentStatusResponse {
  reference: string;
  status: PaymentStatus;
  orderId: string;
}

