export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID ? crypto.randomUUID() : "";
  const randomSuffix = uuid
    ? uuid.substring(0, 8).toUpperCase()
    : timestamp.toString(36).toUpperCase();
  return `ORD-${timestamp}-${randomSuffix}`;
};
