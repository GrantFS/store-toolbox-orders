# @grantfs/store-toolbox-orders

Order processing utilities for Store Toolbox implementations. Provides order ID generation, UK address/phone normalization, and VAT calculations.

## Installation

```bash
npm install @grantfs/store-toolbox-orders
```

## Features

- **Order ID Generation** - Unique timestamped order IDs
- **UK Address Normalization** - Postcode formatting, phone number conversion to +44
- **VAT Calculations** - Per-item and order total calculations with UK VAT rates
- **Validation Utilities** - Field validation helpers with error collection
- **TypeScript** - Full type definitions included
- **Browser Safe** - All exports work in browser environments

## Usage

### Order ID Generation

```typescript
import { generateOrderId } from '@grantfs/store-toolbox-orders';

const orderId = generateOrderId();
// "ORD-1702567890123-A1B2C3D4"
```

### UK Address Normalization

```typescript
import { 
  normalizeUKPostcode, 
  normalizeUKPhone, 
  normalizeUKAddress 
} from '@grantfs/store-toolbox-orders';

// Postcode formatting
normalizeUKPostcode('sw1a1aa');  // "SW1A 1AA"

// Phone to international format
normalizeUKPhone('07123 456789');  // "+447123456789"

// Complete address normalization
normalizeUKAddress({
  line1: '123 Street',
  city: 'London',
  postcode: 'sw1a1aa',
  country: 'UK'
});
// { line1: '123 Street', city: 'London', postcode: 'SW1A 1AA', country: 'United Kingdom' }
```

### VAT Calculations

```typescript
import { 
  calculateVatForItem, 
  calculateOrderTotals,
  UK_VAT_RATES 
} from '@grantfs/store-toolbox-orders';

// Single item VAT (amounts in pence)
const itemWithVat = calculateVatForItem({
  productId: 'P1',
  name: 'Widget',
  quantity: 2,
  unitPrice: 1000,  // £10.00 in pence
});
// { ...item, vatAmount: 400, totalPrice: 2000, totalPriceInclVat: 2400 }

// Complete order totals
const totals = calculateOrderTotals(
  [{ productId: 'P1', name: 'Widget', quantity: 1, unitPrice: 1000 }],
  500,  // shipping in pence
  0     // discount in pence
);
// { subtotal: 1000, totalVat: 300, shippingCost: 500, shippingVat: 100, grandTotal: 1800 }
```

### Validation Utilities

```typescript
import {
  validateRequiredField,
  collectErrors,
  formatValidationErrors
} from '@grantfs/store-toolbox-orders';

const errors = collectErrors([
  validateRequiredField(email, 'email', 'Email is required'),
  validateRequiredField(phone, 'phone', 'Phone is required'),
]);

if (errors.length > 0) {
  console.error(formatValidationErrors(errors));
  // "email: Email is required, phone: Phone is required"
}
```

## Types

### Core Types

```typescript
interface OrderItem {
  productId: string;
  sku?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;      // in pence
  vatRate?: number;       // decimal (0.2 = 20%)
}

interface UKAddress {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

interface Order {
  orderId: string;
  customerId: string;
  items: OrderItemWithVat[];
  shippingAddress: UKAddress;
  billingAddress: UKAddress;
  subtotal: number;       // in pence
  totalVat: number;       // in pence
  grandTotal: number;     // in pence
  status: OrderStatus;
  // ... more fields
}
```

### Repository Interface

Implement for your database:

```typescript
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
  findByCustomerId(customerId: string, options?: OrderQueryOptions): Promise<Order[]>;
  updateStatus(orderId: string, status: OrderStatus): Promise<void>;
  updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<void>;
}
```

## Browser Usage

All exports are browser-safe. For explicit browser imports:

```typescript
import { generateOrderId, normalizeUKPostcode } from '@grantfs/store-toolbox-orders/browser';
```

## VAT Rates

```typescript
import { UK_VAT_RATES } from '@grantfs/store-toolbox-orders';

UK_VAT_RATES.STANDARD  // 0.2 (20%)
UK_VAT_RATES.REDUCED   // 0.05 (5%)
UK_VAT_RATES.ZERO      // 0 (0%)
```

## License

UNLICENSED - Private package
