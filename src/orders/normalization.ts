import { UKAddress } from "../types";

const POSTCODE_INWARD_LENGTH = 3;
const UK_COUNTRY_CODE = "+44";
const PHONE_CLEANING_REGEX = /[\s().\-\/]/g;
const UK_COUNTRY = "United Kingdom";

/**
 * Normalizes a UK postcode to standard format with space.
 * Converts to uppercase and ensures proper spacing (e.g., "SW1A 1AA").
 * 
 * @example
 * normalizeUKPostcode("sw1a1aa") // "SW1A 1AA"
 * normalizeUKPostcode("SW1A 1AA") // "SW1A 1AA"
 */
export const normalizeUKPostcode = (postcode: string): string => {
  const cleanedPostcode = postcode.replace(/\s/g, "").toUpperCase();
  const inwardCode = cleanedPostcode.slice(-POSTCODE_INWARD_LENGTH);
  const outwardCode = cleanedPostcode.slice(0, -POSTCODE_INWARD_LENGTH);
  return `${outwardCode} ${inwardCode}`;
};

/**
 * Normalizes a UK phone number to international format (+44).
 * Removes formatting characters and converts leading 0 to +44.
 * 
 * @example
 * normalizeUKPhone("07123 456789") // "+447123456789"
 * normalizeUKPhone("+447123456789") // "+447123456789"
 */
export const normalizeUKPhone = (phone: string): string => {
  const cleanedPhone = phone.replace(PHONE_CLEANING_REGEX, "");
  const hasUKPrefix = cleanedPhone.startsWith("0");

  if (hasUKPrefix) {
    return UK_COUNTRY_CODE + cleanedPhone.substring(1);
  }

  return cleanedPhone;
};

/**
 * Normalizes a complete UK address.
 * Formats postcode and sets country to "United Kingdom".
 * 
 * @example
 * normalizeUKAddress({ line1: "123 Street", city: "London", postcode: "sw1a1aa", country: "UK" })
 * // { line1: "123 Street", city: "London", postcode: "SW1A 1AA", country: "United Kingdom" }
 */
export const normalizeUKAddress = (address: UKAddress): UKAddress => {
  return {
    ...address,
    postcode: normalizeUKPostcode(address.postcode),
    country: UK_COUNTRY,
  };
};

/**
 * Constants for UK-specific values
 */
export const UK_CONSTANTS = {
  COUNTRY: UK_COUNTRY,
  COUNTRY_CODE: UK_COUNTRY_CODE,
} as const;
