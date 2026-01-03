import type { OrderItem, OrderItemWithVat, OrderTotals } from "../types";
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

const calculateVatAmount = (netAmount: number, vatRate: number): number => {
  return roundToTwoDecimals(netAmount * vatRate);
};

const calculateVat = (netAmount: number, vatRate: number): VatCalculation => {
  const vatAmount = calculateVatAmount(netAmount, vatRate);
  const grossAmount = roundToTwoDecimals(netAmount + vatAmount);
  return { vatAmount, grossAmount };
};

const sumProperty = <T>(items: T[], selector: (item: T) => number): number => {
  return items.reduce((sum, item) => sum + selector(item), 0);
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

const calculateItemsSubtotal = (items: OrderItemWithVat[]): number => {
  return sumProperty(items, (item) => item.totalPrice);
};

const calculateItemsVat = (items: OrderItemWithVat[]): number => {
  return sumProperty(items, (item) => item.vatAmount);
};

const calculateAdjustedVat = (
  itemsVat: number,
  shippingVat: number,
  discountVatReduction: number
): number => {
  return roundToTwoDecimals(
    Math.max(0, itemsVat + shippingVat - discountVatReduction)
  );
};

const calculateGrandTotal = (
  discountedSubtotal: number,
  finalVat: number,
  shippingCost: number
): number => {
  return Math.max(
    0,
    roundToTwoDecimals(discountedSubtotal + finalVat + shippingCost)
  );
};

export const calculateOrderTotals = (
  items: OrderItem[],
  shippingCost: number = 0,
  discount: number = 0
): OrderTotals => {
  const itemsWithVat = items.map(calculateVatForItem);

  const subtotal = calculateItemsSubtotal(itemsWithVat);
  const itemsVat = calculateItemsVat(itemsWithVat);

  const shippingVat = calculateVatAmount(shippingCost, UK_VAT_RATES.STANDARD);
  const discountVatReduction = calculateVatAmount(
    discount,
    UK_VAT_RATES.STANDARD
  );

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const totalVat = calculateAdjustedVat(
    itemsVat,
    shippingVat,
    discountVatReduction
  );
  const grandTotal = calculateGrandTotal(
    discountedSubtotal,
    totalVat,
    shippingCost
  );

  return {
    itemsWithVat,
    subtotal: roundToTwoDecimals(subtotal),
    totalVat,
    shippingCost: roundToTwoDecimals(shippingCost),
    shippingVat: roundToTwoDecimals(shippingVat),
    discount: roundToTwoDecimals(discount),
    grandTotal,
  };
};
