import { ValidationError } from "../types";

/**
 * Rounds a number to two decimal places (for currency calculations).
 * Uses banker's rounding (round half to even) via standard Math.round.
 * 
 * @example
 * roundToTwoDecimals(10.456) // 10.46
 * roundToTwoDecimals(10.454) // 10.45
 */
export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};

/**
 * Creates a validation error object.
 */
export const createValidationError = (
  field: string,
  message: string,
): ValidationError => ({
  field,
  message,
});

/**
 * Creates a nested field path for validation errors.
 * 
 * @example
 * createFieldPath("shipping", "postcode") // "shipping.postcode"
 * createFieldPath(undefined, "email") // "email"
 */
export const createFieldPath = (
  prefix: string | undefined,
  field: string,
): string => {
  return prefix ? `${prefix}.${field}` : field;
};

/**
 * Validates that a required field has a value.
 * Returns null if valid, ValidationError if invalid.
 */
export const validateRequiredField = (
  value: string | undefined,
  fieldName: string,
  errorMessage: string,
): ValidationError | null => {
  if (!value) {
    return createValidationError(fieldName, errorMessage);
  }
  return null;
};

/**
 * Validates that a string meets minimum length requirement.
 * Returns null if valid, ValidationError if invalid.
 */
export const validateMinLength = (
  value: string | undefined,
  fieldName: string,
  minLength: number,
  errorMessage: string,
): ValidationError | null => {
  if (!value || value.trim().length < minLength) {
    return createValidationError(fieldName, errorMessage);
  }
  return null;
};

/**
 * Filters out null values from an array of potential validation errors.
 * Returns only the actual ValidationError objects.
 */
export const collectErrors = (
  errors: (ValidationError | null)[],
): ValidationError[] => {
  return errors.filter((error): error is ValidationError => error !== null);
};

/**
 * Formats an array of validation errors into a human-readable string.
 * 
 * @example
 * formatValidationErrors([{ field: "email", message: "Required" }])
 * // "email: Required"
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map((e) => `${e.field}: ${e.message}`).join(", ");
};
