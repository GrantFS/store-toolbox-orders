// Types
export type {
  OrderItem,
  OrderItemWithVat,
  UKAddress,
  CreateOrderRequest,
  Order,
  OrderCreatedEventDetail,
  OrderTotals,
  ValidationError,
  OrderValidationResult,
  OrderQueryOptions,
  OrderRepository,
  OrdersConfig,
} from "./types";

export {
  OrderStatus,
  PaymentStatus,
  ShippingMethod,
} from "./types";

// Order functions
export {
  generateOrderId,
  normalizeUKPostcode,
  normalizeUKPhone,
  normalizeUKAddress,
  UK_CONSTANTS,
  calculateVatForItem,
  calculateOrderTotals,
  UK_VAT_RATES,
  roundToTwoDecimals,
  createValidationError,
  createFieldPath,
  validateRequiredField,
  validateMinLength,
  collectErrors,
  formatValidationErrors,
} from "./orders";
