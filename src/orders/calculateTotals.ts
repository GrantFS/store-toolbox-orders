import { OrderItem, OrderItemWithVat, OrderTotals } from "../types";
import { roundToTwoDecimals } from "./utils";

export const UK_VAT_RATES = {
  STANDARD: 0.2,
  REDUCED: 0.05,
  ZERO: 0,
} as const;

interface VatCalculation {
  vatAmount: number;
  grossAmount: number;
}

const calculateVat = (netAmount: number, vatRate: number): VatCalculation => {
  const vatAmount = roundToTwoDecimals(netAmount * vatRate);
  const grossAmount = roundToTwoDecimals(netAmount + vatAmount);
  return { vatAmount, grossAmount };
};

export const calculateVatForItem = (item: OrderItem): OrderItemWithVat => {
  const vatRate = item.vatRate ?? UK_VAT_RATES.STANDARD;
  const totalPriceExclVat = item.unitPrice * item.quantity;
  const { vatAmount, grossAmount } = calculateVat(totalPriceExclVat, vatRate);

  return {
    ...item,
    vatAmount,
    totalPrice: totalPriceExclVat,
    totalPriceInclVat: grossAmount,
  };
};

const sumItemTotals = (items: OrderItemWithVat[]): number => {
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
};

const sumItemVat = (items: OrderItemWithVat[]): number => {
  return items.reduce((sum, item) => sum + item.vatAmount, 0);
};

export const calculateOrderTotals = (
  items: OrderItem[],
  shippingCost: number = 0,
  discount: number = 0
): OrderTotals => {
  const itemsWithVat = items.map(calculateVatForItem);

  const subtotal = sumItemTotals(itemsWithVat);
  const totalVat = sumItemVat(itemsWithVat);

  const { vatAmount: shippingVat } = calculateVat(
    shippingCost,
    UK_VAT_RATES.STANDARD
  );

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const { vatAmount: discountVatReduction } = calculateVat(
    discount,
    UK_VAT_RATES.STANDARD
  );

  const finalTotalVat = roundToTwoDecimals(
    Math.max(0, totalVat + shippingVat - discountVatReduction)
  );

  const grandTotal = Math.max(
    0,
    roundToTwoDecimals(discountedSubtotal + finalTotalVat + shippingCost)
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
