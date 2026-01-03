export { generateOrderId } from "./generateOrderId";

export {
  normalizeUKPostcode,
  normalizeUKPhone,
  normalizeUKAddress,
  UK_CONSTANTS,
} from "./normalization";

export {
  calculateVatForItem,
  calculateOrderTotals,
  UK_VAT_RATES,
} from "./calculateTotals";

export {
  roundToTwoDecimals,
  createValidationError,
  createFieldPath,
  validateRequiredField,
  validateMinLength,
  collectErrors,
  formatValidationErrors,
} from "./utils";
