export interface OrderItem {
  productId: string;
  sku?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number; // pence
  vatRate?: number; // decimal (0.2 = 20%)
}

export interface OrderItemWithVat extends OrderItem {
  vatAmount: number; // pence
  totalPrice: number; // pence, excluding VAT
  totalPriceInclVat: number; // pence
}

export interface UKAddress {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

export interface CreateOrderRequest {
  customerId: string;
  email: string;
  phone: string;
  items: OrderItem[];
  shippingAddress: UKAddress;
  billingAddress?: UKAddress;
  notes?: string;
  promoCode?: string;
  shippingMethod?: ShippingMethod;
}

export interface Order {
  orderId: string;
  customerId: string;
  email: string;
  phone: string;
  items: OrderItemWithVat[];
  shippingAddress: UKAddress;
  billingAddress: UKAddress;
  subtotal: number; // pence, excluding VAT
  totalVat: number; // pence
  shippingCost: number; // pence
  discount: number; // pence
  grandTotal: number; // pence, including VAT
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  promoCode?: string;
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum ShippingMethod {
  STANDARD = "standard",
  EXPRESS = "express",
  NEXT_DAY = "nextDay",
}

export interface OrderCreatedEventDetail {
  orderId: string;
  customerId: string;
  email: string;
  items: OrderItemWithVat[];
  subtotal: number;
  totalVat: number;
  grandTotal: number;
  shippingAddress: UKAddress;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderTotals {
  itemsWithVat: OrderItemWithVat[];
  subtotal: number; // pence, excluding VAT
  totalVat: number; // pence
  shippingCost: number; // pence
  shippingVat: number; // pence
  discount: number; // pence
  grandTotal: number; // pence
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface OrderValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface OrderQueryOptions {
  limit?: number;
  cursor?: string;
  status?: OrderStatus;
}

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
  findByCustomerId(
    customerId: string,
    options?: OrderQueryOptions
  ): Promise<Order[]>;
  updateStatus(orderId: string, status: OrderStatus): Promise<void>;
  updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<void>;
}

export interface OrdersConfig {
  defaultVatRate: number; // decimal (0.2 = 20%)
  currency: string;
  freeShippingThreshold: number; // pence (0 = no free shipping)
  standardShippingCost: number; // pence
}
