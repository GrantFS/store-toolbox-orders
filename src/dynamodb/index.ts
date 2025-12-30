/**
 * @grantfs/store-toolbox-orders/dynamodb
 *
 * DynamoDB implementation for the OrderRepository interface.
 * Provides factory function and key generators for storing orders in DynamoDB.
 *
 * @example
 * ```typescript
 * import { createDynamoOrderRepository } from "@grantfs/store-toolbox-orders/dynamodb";
 *
 * const repository = createDynamoOrderRepository(getRepositoryContext());
 * await repository.save(order);
 * ```
 */

// Factory function
export {
  createDynamoOrderRepository,
  type DynamoOrderRepositoryConfig,
} from "./createDynamoOrderRepository";

// Key generators
export {
  createOrderKeyGenerators,
  type DynamoKey,
  type OrderKeyGeneratorConfig,
  type OrderKeyGenerators,
} from "./keys";

// Helper functions
export {
  updateOrderPaymentStatus,
  updateOrderStatusAndPayment,
} from "./helpers";
