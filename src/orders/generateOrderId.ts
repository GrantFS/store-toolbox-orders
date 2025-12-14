/**
 * Generates a unique order ID with timestamp and random component.
 * Format: ORD-{timestamp}-{random}
 * 
 * @example
 * generateOrderId() // "ORD-1702567890123-A1B2C3D4"
 */
export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID ? crypto.randomUUID() : "";
  const random = uuid
    ? uuid.substring(0, 8).toUpperCase()
    : timestamp.toString(36).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};
