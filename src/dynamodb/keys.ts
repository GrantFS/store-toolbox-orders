/**
 * Order DynamoDB key generators
 *
 * Creates consistent DynamoDB keys for order entities.
 * Uses configurable prefixes for multi-business support.
 */

export interface DynamoKey {
  pk: string;
  sk: string;
}

export interface OrderKeyGeneratorConfig {
  orderPrefix?: string;
  customerPrefix?: string;
}

const DEFAULT_CONFIG: Required<OrderKeyGeneratorConfig> = {
  orderPrefix: "ORDER",
  customerPrefix: "CUSTOMER",
};

/**
 * Creates key generators for order entities
 *
 * @param config - Optional configuration for key prefixes
 * @returns Object with key generator functions
 *
 * @example
 * ```typescript
 * const keys = createOrderKeyGenerators();
 * const orderKey = keys.order("ORD-123");
 * // { pk: "ORDER#ORD-123", sk: "ORDER#ORD-123" }
 * ```
 */
export const createOrderKeyGenerators = (config?: OrderKeyGeneratorConfig) => {
  const { orderPrefix, customerPrefix } = { ...DEFAULT_CONFIG, ...config };

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
