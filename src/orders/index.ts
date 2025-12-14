// Order ID generation
export { generateOrderId } from "./generateOrderId";

// UK address and phone normalization
export {
  normalizeUKPostcode,
  normalizeUKPhone,
  normalizeUKAddress,
  UK_CONSTANTS,
} from "./normalization";

// Order total calculations
export {
  calculateVatForItem,
  calculateOrderTotals,
  UK_VAT_RATES,
} from "./calculateTotals";

// Utility functions
export {
  roundToTwoDecimals,
  createValidationError,
  createFieldPath,
  validateRequiredField,
  validateMinLength,
  collectErrors,
  formatValidationErrors,
} from "./utils";
