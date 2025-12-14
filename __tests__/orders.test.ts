import {
  generateOrderId,
  normalizeUKPostcode,
  normalizeUKPhone,
  normalizeUKAddress,
  calculateVatForItem,
  calculateOrderTotals,
  roundToTwoDecimals,
  createValidationError,
  collectErrors,
  formatValidationErrors,
  UK_VAT_RATES,
} from "../src";

describe("generateOrderId", () => {
  it("should generate an order ID with ORD prefix", () => {
    const orderId = generateOrderId();
    expect(orderId).toMatch(/^ORD-\d+-[A-Z0-9]+$/);
  });

  it("should generate unique IDs", () => {
    const id1 = generateOrderId();
    const id2 = generateOrderId();
    expect(id1).not.toBe(id2);
  });
});

describe("normalizeUKPostcode", () => {
  it("should format postcode with correct spacing", () => {
    expect(normalizeUKPostcode("sw1a1aa")).toBe("SW1A 1AA");
    expect(normalizeUKPostcode("SW1A1AA")).toBe("SW1A 1AA");
    expect(normalizeUKPostcode("sw1a 1aa")).toBe("SW1A 1AA");
  });

  it("should handle postcodes with existing spaces", () => {
    expect(normalizeUKPostcode("SW1A 1AA")).toBe("SW1A 1AA");
    expect(normalizeUKPostcode("  SW1A  1AA  ")).toBe("SW1A 1AA");
  });

  it("should handle shorter postcodes", () => {
    expect(normalizeUKPostcode("m11aa")).toBe("M1 1AA");
    expect(normalizeUKPostcode("M1 1AA")).toBe("M1 1AA");
  });
});

describe("normalizeUKPhone", () => {
  it("should convert UK mobile to international format", () => {
    expect(normalizeUKPhone("07123456789")).toBe("+447123456789");
    expect(normalizeUKPhone("07123 456 789")).toBe("+447123456789");
  });

  it("should convert UK landline to international format", () => {
    expect(normalizeUKPhone("02012345678")).toBe("+442012345678");
    expect(normalizeUKPhone("020 1234 5678")).toBe("+442012345678");
  });

  it("should preserve numbers already in international format", () => {
    expect(normalizeUKPhone("+447123456789")).toBe("+447123456789");
  });

  it("should remove formatting characters", () => {
    expect(normalizeUKPhone("(020) 1234-5678")).toBe("+442012345678");
    expect(normalizeUKPhone("020.1234.5678")).toBe("+442012345678");
  });
});

describe("normalizeUKAddress", () => {
  it("should normalize postcode and set country", () => {
    const address = {
      line1: "123 Test Street",
      city: "London",
      postcode: "sw1a1aa",
      country: "UK",
    };

    const result = normalizeUKAddress(address);

    expect(result.postcode).toBe("SW1A 1AA");
    expect(result.country).toBe("United Kingdom");
    expect(result.line1).toBe("123 Test Street");
    expect(result.city).toBe("London");
  });

  it("should preserve optional fields", () => {
    const address = {
      line1: "123 Test Street",
      line2: "Apartment 4",
      city: "London",
      county: "Greater London",
      postcode: "sw1a1aa",
      country: "UK",
    };

    const result = normalizeUKAddress(address);

    expect(result.line2).toBe("Apartment 4");
    expect(result.county).toBe("Greater London");
  });
});

describe("calculateVatForItem", () => {
  it("should calculate VAT at standard rate (20%)", () => {
    const item = {
      productId: "P1",
      name: "Widget",
      quantity: 1,
      unitPrice: 1000,
    };

    const result = calculateVatForItem(item);

    expect(result.totalPrice).toBe(1000);
    expect(result.vatAmount).toBe(200);
    expect(result.totalPriceInclVat).toBe(1200);
  });

  it("should multiply by quantity", () => {
    const item = {
      productId: "P1",
      name: "Widget",
      quantity: 3,
      unitPrice: 1000,
    };

    const result = calculateVatForItem(item);

    expect(result.totalPrice).toBe(3000);
    expect(result.vatAmount).toBe(600);
    expect(result.totalPriceInclVat).toBe(3600);
  });

  it("should use custom VAT rate when provided", () => {
    const item = {
      productId: "P1",
      name: "Childrens Clothing",
      quantity: 1,
      unitPrice: 1000,
      vatRate: UK_VAT_RATES.ZERO,
    };

    const result = calculateVatForItem(item);

    expect(result.vatAmount).toBe(0);
    expect(result.totalPriceInclVat).toBe(1000);
  });

  it("should handle reduced VAT rate (5%)", () => {
    const item = {
      productId: "P1",
      name: "Energy",
      quantity: 1,
      unitPrice: 1000,
      vatRate: UK_VAT_RATES.REDUCED,
    };

    const result = calculateVatForItem(item);

    expect(result.vatAmount).toBe(50);
    expect(result.totalPriceInclVat).toBe(1050);
  });
});

describe("calculateOrderTotals", () => {
  it("should calculate totals for single item", () => {
    const items = [
      { productId: "P1", name: "Widget", quantity: 1, unitPrice: 1000 },
    ];

    const result = calculateOrderTotals(items);

    expect(result.subtotal).toBe(1000);
    expect(result.totalVat).toBe(200);
    expect(result.grandTotal).toBe(1200);
  });

  it("should calculate totals for multiple items", () => {
    const items = [
      { productId: "P1", name: "Widget", quantity: 2, unitPrice: 1000 },
      { productId: "P2", name: "Gadget", quantity: 1, unitPrice: 500 },
    ];

    const result = calculateOrderTotals(items);

    expect(result.subtotal).toBe(2500);
    expect(result.totalVat).toBe(500);
    expect(result.grandTotal).toBe(3000);
  });

  it("should add shipping cost with VAT", () => {
    const items = [
      { productId: "P1", name: "Widget", quantity: 1, unitPrice: 1000 },
    ];

    const result = calculateOrderTotals(items, 500);

    expect(result.shippingCost).toBe(500);
    expect(result.shippingVat).toBe(100);
    expect(result.grandTotal).toBe(1800); // 1000 + 200 (item VAT) + 500 + 100 (shipping VAT)
  });

  it("should apply discount", () => {
    const items = [
      { productId: "P1", name: "Widget", quantity: 1, unitPrice: 1000 },
    ];

    const result = calculateOrderTotals(items, 0, 200);

    expect(result.discount).toBe(200);
    expect(result.subtotal).toBe(1000);
    // Discount of 200 reduces VAT by 40 (20% of 200)
    expect(result.totalVat).toBe(160);
    expect(result.grandTotal).toBe(960); // 800 + 160
  });

  it("should not allow negative subtotal from discount", () => {
    const items = [
      { productId: "P1", name: "Widget", quantity: 1, unitPrice: 100 },
    ];

    const result = calculateOrderTotals(items, 0, 500);

    // Subtotal capped at 0, but discount VAT reduction is still calculated
    expect(result.grandTotal).toBeGreaterThanOrEqual(0);
  });
});

describe("roundToTwoDecimals", () => {
  it("should round to two decimal places", () => {
    expect(roundToTwoDecimals(10.456)).toBe(10.46);
    expect(roundToTwoDecimals(10.454)).toBe(10.45);
    expect(roundToTwoDecimals(10.455)).toBe(10.46);
  });

  it("should handle whole numbers", () => {
    expect(roundToTwoDecimals(10)).toBe(10);
  });

  it("should handle single decimal", () => {
    expect(roundToTwoDecimals(10.5)).toBe(10.5);
  });
});

describe("validation utilities", () => {
  describe("createValidationError", () => {
    it("should create error object", () => {
      const error = createValidationError("email", "Email is required");
      expect(error).toEqual({ field: "email", message: "Email is required" });
    });
  });

  describe("collectErrors", () => {
    it("should filter out null values", () => {
      const errors = collectErrors([
        createValidationError("email", "Required"),
        null,
        createValidationError("phone", "Invalid"),
        null,
      ]);

      expect(errors).toHaveLength(2);
      expect(errors[0]?.field).toBe("email");
      expect(errors[1]?.field).toBe("phone");
    });

    it("should return empty array for all nulls", () => {
      const errors = collectErrors([null, null]);
      expect(errors).toHaveLength(0);
    });
  });

  describe("formatValidationErrors", () => {
    it("should format errors as string", () => {
      const errors = [
        createValidationError("email", "Required"),
        createValidationError("phone", "Invalid format"),
      ];

      const result = formatValidationErrors(errors);
      expect(result).toBe("email: Required, phone: Invalid format");
    });

    it("should handle empty array", () => {
      expect(formatValidationErrors([])).toBe("");
    });
  });
});
