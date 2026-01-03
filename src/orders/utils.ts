import { ValidationError } from "../types";

export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const createValidationError = (
  field: string,
  message: string
): ValidationError => ({
  field,
  message,
});

export const createFieldPath = (
  prefix: string | undefined,
  field: string
): string => {
  return prefix ? `${prefix}.${field}` : field;
};

export const validateRequiredField = (
  value: string | undefined,
  fieldName: string,
  errorMessage: string
): ValidationError | null => {
  if (!value) {
    return createValidationError(fieldName, errorMessage);
  }
  return null;
};

export const validateMinLength = (
  value: string | undefined,
  fieldName: string,
  minLength: number,
  errorMessage: string
): ValidationError | null => {
  if (!value || value.trim().length < minLength) {
    return createValidationError(fieldName, errorMessage);
  }
  return null;
};

export const collectErrors = (
  errors: (ValidationError | null)[]
): ValidationError[] => {
  return errors.filter((error): error is ValidationError => error !== null);
};

export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map((e) => `${e.field}: ${e.message}`).join(", ");
};
