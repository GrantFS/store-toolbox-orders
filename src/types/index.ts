// ============================================================================
// Money & VAT Types (all monetary values are in pence)
// ============================================================================

export type PriceInPence = number;
export type VatRateDecimal = number;

// ============================================================================
// Address Types
// ============================================================================

export interface UKAddress {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

// ============================================================================
// Order Item Types
// ============================================================================

export interface OrderItem {
  productId: string;
  sku?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: PriceInPence;
  vatRate?: VatRateDecimal;
}

export interface OrderItemWithVat extends OrderItem {
  vatAmount: PriceInPence;
  totalPrice: PriceInPence;
  totalPriceInclVat: PriceInPence;
}

// ============================================================================
// Order Status Types
// ============================================================================

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

// ============================================================================
// Order Types
// ============================================================================

export interface Order {
  orderId: string;
  customerId: string;
  email: string;
  phone: string;
  items: OrderItemWithVat[];
  shippingAddress: UKAddress;
  billingAddress: UKAddress;
  subtotal: PriceInPence;
  totalVat: PriceInPence;
  shippingCost: PriceInPence;
  discount: PriceInPence;
  grandTotal: PriceInPence;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  promoCode?: string;
  createdAt: string;
  updatedAt: string;
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

export interface OrderTotals {
  itemsWithVat: OrderItemWithVat[];
  subtotal: PriceInPence;
  totalVat: PriceInPence;
  shippingCost: PriceInPence;
  shippingVat: PriceInPence;
  discount: PriceInPence;
  grandTotal: PriceInPence;
}

// ============================================================================
// Order Event Types
// ============================================================================

export interface OrderCreatedEventDetail {
  orderId: string;
  customerId: string;
  email: string;
  items: OrderItemWithVat[];
  subtotal: PriceInPence;
  totalVat: PriceInPence;
  grandTotal: PriceInPence;
  shippingAddress: UKAddress;
  status: OrderStatus;
  createdAt: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface OrderValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// Repository Types
// ============================================================================

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

// ============================================================================
// Configuration Types
// ============================================================================

export interface OrdersConfig {
  defaultVatRate: VatRateDecimal;
  currency: string;
  freeShippingThreshold: PriceInPence;
  standardShippingCost: PriceInPence;
}
