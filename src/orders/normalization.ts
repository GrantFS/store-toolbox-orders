import type { UKAddress } from "../types";

export const UK_CONSTANTS = {
  COUNTRY: "United Kingdom",
  COUNTRY_CODE: "+44",
  POSTCODE_INWARD_LENGTH: 3,
} as const;

const PHONE_FORMATTING_PATTERN = /[\s().\-/]/g;
const WHITESPACE_PATTERN = /\s/g;
const UK_LOCAL_PREFIX = "0";

const removeWhitespace = (text: string): string => {
  return text.replace(WHITESPACE_PATTERN, "");
};

const removePhoneFormatting = (phone: string): string => {
  return phone.replace(PHONE_FORMATTING_PATTERN, "");
};

const hasUKLocalPrefix = (phone: string): boolean => {
  return phone.startsWith(UK_LOCAL_PREFIX);
};

const convertToInternationalFormat = (localPhone: string): string => {
  return UK_CONSTANTS.COUNTRY_CODE + localPhone.substring(1);
};

export const normalizeUKPostcode = (postcode: string): string => {
  const cleaned = removeWhitespace(postcode).toUpperCase();
  const inwardCode = cleaned.slice(-UK_CONSTANTS.POSTCODE_INWARD_LENGTH);
  const outwardCode = cleaned.slice(0, -UK_CONSTANTS.POSTCODE_INWARD_LENGTH);
  return `${outwardCode} ${inwardCode}`;
};

export const normalizeUKPhone = (phone: string): string => {
  const cleaned = removePhoneFormatting(phone);

  if (hasUKLocalPrefix(cleaned)) {
    return convertToInternationalFormat(cleaned);
  }

  return cleaned;
};

export const normalizeUKAddress = (address: UKAddress): UKAddress => {
  return {
    ...address,
    postcode: normalizeUKPostcode(address.postcode),
    country: UK_CONSTANTS.COUNTRY,
  };
};
