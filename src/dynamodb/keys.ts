export interface DynamoKey {
  pk: string;
  sk: string;
}

export interface OrderKeyGeneratorConfig {
  orderPrefix?: string;
  customerPrefix?: string;
}

const DEFAULT_KEY_PREFIXES = {
  order: "ORDER",
  customer: "CUSTOMER",
} as const;

export const createOrderKeyGenerators = (config?: OrderKeyGeneratorConfig) => {
  const orderPrefix = config?.orderPrefix ?? DEFAULT_KEY_PREFIXES.order;
  const customerPrefix = config?.customerPrefix ?? DEFAULT_KEY_PREFIXES.customer;

  return {
    order: (orderId: string): DynamoKey => ({
      pk: `${orderPrefix}#${orderId}`,
      sk: `${orderPrefix}#${orderId}`,
    }),

    orderByCustomer: (
      customerId: string,
      createdAt: string
    ): { gsi1pk: string; gsi1sk: string } => ({
      gsi1pk: `${customerPrefix}#${customerId}`,
      gsi1sk: `${orderPrefix}#${createdAt}`,
    }),

    prefixes: {
      order: orderPrefix,
      customer: customerPrefix,
    },
  };
};

export type OrderKeyGenerators = ReturnType<typeof createOrderKeyGenerators>;
