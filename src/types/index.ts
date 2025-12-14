/**
 * Order item before VAT calculation
 */
export interface OrderItem {
  productId: string;
  sku?: string;
  name: string;
  description?: string;
  quantity: number;
  /** Unit price in pence (smallest currency unit) */
  unitPrice: number;
  /** VAT rate as decimal (0.2 for 20%). Defaults to standard rate if not provided */
  vatRate?: number;
}

/**
 * Order item with calculated VAT amounts
 */
export interface OrderItemWithVat extends OrderItem {
  /** VAT amount in pence */
  vatAmount: number;
  /** Total price excluding VAT in pence */
  totalPrice: number;
  /** Total price including VAT in pence */
  totalPriceInclVat: number;
}

/**
 * UK address structure
 */
export interface UKAddress {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

/**
 * Order creation request
 */
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

/**
 * Complete order object
 */
export interface Order {
  orderId: string;
  customerId: string;
  email: string;
  phone: string;
  items: OrderItemWithVat[];
  shippingAddress: UKAddress;
  billingAddress: UKAddress;
  /** Subtotal in pence (excluding VAT) */
  subtotal: number;
  /** Total VAT in pence */
  totalVat: number;
  /** Shipping cost in pence */
  shippingCost: number;
  /** Discount in pence */
  discount: number;
  /** Grand total in pence (including VAT) */
  grandTotal: number;
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

/**
 * Order created event detail for EventBridge
 */
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

/**
 * Calculated order totals
 */
export interface OrderTotals {
  itemsWithVat: OrderItemWithVat[];
  /** Subtotal in pence (excluding VAT) */
  subtotal: number;
  /** Total VAT in pence */
  totalVat: number;
  /** Shipping cost in pence */
  shippingCost: number;
  /** Shipping VAT in pence */
  shippingVat: number;
  /** Discount in pence */
  discount: number;
  /** Grand total in pence */
  grandTotal: number;
}

/**
 * Validation error for order fields
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Order validation result
 */
export interface OrderValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Query options for order repository
 */
export interface OrderQueryOptions {
  limit?: number;
  cursor?: string;
  status?: OrderStatus;
}

/**
 * Order repository interface - consumers implement for their database
 */
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
  findByCustomerId(customerId: string, options?: OrderQueryOptions): Promise<Order[]>;
  updateStatus(orderId: string, status: OrderStatus): Promise<void>;
  updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<void>;
}

/**
 * Configuration for order processing
 */
export interface OrdersConfig {
  /** Default VAT rate as decimal (e.g., 0.2 for 20%) */
  defaultVatRate: number;
  /** Currency code (e.g., 'GBP') */
  currency: string;
  /** Free shipping threshold in pence (0 = no free shipping) */
  freeShippingThreshold: number;
  /** Standard shipping cost in pence */
  standardShippingCost: number;
}
