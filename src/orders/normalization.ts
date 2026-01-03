import { UKAddress } from "../types";

const POSTCODE_INWARD_LENGTH = 3;
const UK_COUNTRY_CODE = "+44";
const PHONE_FORMATTING_CHARS = /[\s().\-/]/g;
const UK_COUNTRY = "United Kingdom";

export const normalizeUKPostcode = (postcode: string): string => {
  const cleanedPostcode = postcode.replace(/\s/g, "").toUpperCase();
  const inwardCode = cleanedPostcode.slice(-POSTCODE_INWARD_LENGTH);
  const outwardCode = cleanedPostcode.slice(0, -POSTCODE_INWARD_LENGTH);
  return `${outwardCode} ${inwardCode}`;
};

export const normalizeUKPhone = (phone: string): string => {
  const cleanedPhone = phone.replace(PHONE_FORMATTING_CHARS, "");
  const startsWithUKPrefix = cleanedPhone.startsWith("0");

  if (startsWithUKPrefix) {
    return UK_COUNTRY_CODE + cleanedPhone.substring(1);
  }

  return cleanedPhone;
};

export const normalizeUKAddress = (address: UKAddress): UKAddress => {
  return {
    ...address,
    postcode: normalizeUKPostcode(address.postcode),
    country: UK_COUNTRY,
  };
};

export const UK_CONSTANTS = {
  COUNTRY: UK_COUNTRY,
  COUNTRY_CODE: UK_COUNTRY_CODE,
} as const;
