export interface PrimaryKey {
  pk: string;
  sk: string;
}

export interface GSI1Key {
  gsi1pk: string;
  gsi1sk: string;
}

export interface KeyPrefixes {
  order: string;
  customer: string;
}

export interface OrderKeyGeneratorConfig {
  orderPrefix?: string;
  customerPrefix?: string;
}

export interface OrderKeyGenerators {
  order(orderId: string): PrimaryKey;
  orderByCustomer(customerId: string, createdAt: string): GSI1Key;
  prefixes: KeyPrefixes;
}

const DEFAULT_KEY_PREFIXES: KeyPrefixes = {
  order: "ORDER",
  customer: "CUSTOMER",
};

export function createOrderKeyGenerators(
  config?: OrderKeyGeneratorConfig
): OrderKeyGenerators {
  const orderPrefix = config?.orderPrefix ?? DEFAULT_KEY_PREFIXES.order;
  const customerPrefix = config?.customerPrefix ?? DEFAULT_KEY_PREFIXES.customer;

  return {
    order(orderId: string): PrimaryKey {
      return {
        pk: `${orderPrefix}#${orderId}`,
        sk: `${orderPrefix}#${orderId}`,
      };
    },

    orderByCustomer(customerId: string, createdAt: string): GSI1Key {
      return {
        gsi1pk: `${customerPrefix}#${customerId}`,
        gsi1sk: `${orderPrefix}#${createdAt}`,
      };
    },

    prefixes: {
      order: orderPrefix,
      customer: customerPrefix,
    },
  };
}
