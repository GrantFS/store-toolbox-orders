const ORDER_PREFIX = "ORD";
const UUID_SUFFIX_LENGTH = 8;

const generateRandomSuffix = (): string => {
  if (crypto.randomUUID) {
    return crypto.randomUUID().substring(0, UUID_SUFFIX_LENGTH).toUpperCase();
  }
  return Date.now().toString(36).toUpperCase();
};

export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const suffix = generateRandomSuffix();
  return `${ORDER_PREFIX}-${timestamp}-${suffix}`;
};
