import type { ValidationError } from "../types";

const DECIMAL_PLACES = 2;
const DECIMAL_MULTIPLIER = Math.pow(10, DECIMAL_PLACES);

export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * DECIMAL_MULTIPLIER) / DECIMAL_MULTIPLIER;
};

export const createValidationError = (
  field: string,
  message: string
): ValidationError => {
  return { field, message };
};

export const createFieldPath = (
  prefix: string | undefined,
  field: string
): string => {
  return prefix ? `${prefix}.${field}` : field;
};

const isEmptyString = (value: string | undefined): value is undefined | "" => {
  return !value;
};

const isTooShort = (value: string, minLength: number): boolean => {
  return value.trim().length < minLength;
};

export const validateRequiredField = (
  value: string | undefined,
  fieldName: string,
  errorMessage: string
): ValidationError | null => {
  if (isEmptyString(value)) {
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
  if (isEmptyString(value) || isTooShort(value, minLength)) {
    return createValidationError(fieldName, errorMessage);
  }
  return null;
};

const isValidationError = (
  error: ValidationError | null
): error is ValidationError => {
  return error !== null;
};

export const collectErrors = (
  errors: (ValidationError | null)[]
): ValidationError[] => {
  return errors.filter(isValidationError);
};

const formatSingleError = (error: ValidationError): string => {
  return `${error.field}: ${error.message}`;
};

export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(formatSingleError).join(", ");
};
