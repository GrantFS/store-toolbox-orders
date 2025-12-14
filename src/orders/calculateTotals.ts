import { OrderItem, OrderItemWithVat, OrderTotals } from "../types";
import { roundToTwoDecimals } from "./utils";

/**
 * UK VAT rates as decimals
 */
export const UK_VAT_RATES = {
  STANDARD: 0.2,
  REDUCED: 0.05,
  ZERO: 0,
} as const;

/**
 * Calculate VAT for a given net amount and rate.
 * Returns both the VAT amount and gross amount.
 */
const calculateVAT = (
  netAmount: number,
  vatRate: number,
): { vatAmount: number; grossAmount: number } => {
  const vatAmount = roundToTwoDecimals(netAmount * vatRate);
  const grossAmount = roundToTwoDecimals(netAmount + vatAmount);
  return { vatAmount, grossAmount };
};

/**
 * Calculates VAT for a single order item.
 * Uses the item's vatRate or defaults to standard UK rate (20%).
 * 
 * @example
 * calculateVatForItem({ productId: "P1", name: "Widget", quantity: 2, unitPrice: 1000 })
 * // { ...item, vatAmount: 400, totalPrice: 2000, totalPriceInclVat: 2400 }
 */
export const calculateVatForItem = (item: OrderItem): OrderItemWithVat => {
  const vatRate = item.vatRate ?? UK_VAT_RATES.STANDARD;
  const totalPriceExclVat = item.unitPrice * item.quantity;
  const { vatAmount, grossAmount } = calculateVAT(totalPriceExclVat, vatRate);

  return {
    ...item,
    vatAmount,
    totalPrice: totalPriceExclVat,
    totalPriceInclVat: grossAmount,
  };
};

/**
 * Calculates complete order totals including VAT for all items,
 * shipping, and discounts.
 * 
 * All amounts are in pence (smallest currency unit).
 * Grand total is capped at 0 minimum (no negative totals).
 * 
 * @param items - Order items (prices in pence)
 * @param shippingCost - Shipping cost in pence (default: 0)
 * @param discount - Discount amount in pence (default: 0)
 * 
 * @example
 * calculateOrderTotals([
 *   { productId: "P1", name: "Widget", quantity: 1, unitPrice: 1000 }
 * ], 500, 0)
 * // { subtotal: 1000, totalVat: 300, shippingCost: 500, shippingVat: 100, grandTotal: 1800 }
 */
export const calculateOrderTotals = (
  items: OrderItem[],
  shippingCost: number = 0,
  discount: number = 0,
): OrderTotals => {
  const itemsWithVat = items.map(calculateVatForItem);

  const subtotal = itemsWithVat.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalVat = itemsWithVat.reduce((sum, item) => sum + item.vatAmount, 0);

  // Calculate VAT on shipping (standard rate)
  const { vatAmount: shippingVat } = calculateVAT(
    shippingCost,
    UK_VAT_RATES.STANDARD,
  );

  // Apply discount to subtotal before VAT
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const { vatAmount: discountVatReduction } = calculateVAT(
    discount,
    UK_VAT_RATES.STANDARD,
  );

  const finalTotalVat = roundToTwoDecimals(
    Math.max(0, totalVat + shippingVat - discountVatReduction),
  );
  
  // Grand total cannot be negative
  const grandTotal = Math.max(
    0,
    roundToTwoDecimals(discountedSubtotal + finalTotalVat + shippingCost),
  );

  return {
    itemsWithVat,
    subtotal: roundToTwoDecimals(subtotal),
    totalVat: roundToTwoDecimals(finalTotalVat),
    shippingCost: roundToTwoDecimals(shippingCost),
    shippingVat: roundToTwoDecimals(shippingVat),
    discount: roundToTwoDecimals(discount),
    grandTotal,
  };
};
