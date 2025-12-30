/**
 * Order DynamoDB helper functions
 *
 * Standalone functions for common order operations that work outside
 * the repository pattern. Useful for cross-service updates.
 */

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { RepositoryContext } from "@grantfs/store-toolbox-core";
import type { OrderStatus } from "../types";
import { PaymentStatus } from "../types";
import { createOrderKeyGenerators, type OrderKeyGeneratorConfig } from "./keys";

/**
 * Updates the payment status of an order
 *
 * Standalone function that doesn't require a repository instance.
 * Useful for webhook handlers and cross-service updates.
 *
 * @param ctx - Repository context with tableName and docClient
 * @param orderId - The order ID to update
 * @param paymentStatus - The new payment status
 * @param config - Optional key generator configuration
 *
 * @example
 * ```typescript
 * import { updateOrderPaymentStatus } from "@grantfs/store-toolbox-orders/dynamodb";
 *
 * await updateOrderPaymentStatus(ctx, "ORD-123", PaymentStatus.SUCCEEDED);
 * ```
 */
export const updateOrderPaymentStatus = async (
  ctx: RepositoryContext,
  orderId: string,
  paymentStatus: PaymentStatus,
  config?: OrderKeyGeneratorConfig
): Promise<void> => {
  const { tableName, docClient } = ctx;

  if (!docClient) {
    throw new Error("docClient is required in RepositoryContext");
  }

  const keys = createOrderKeyGenerators(config);

  const command = new UpdateCommand({
    TableName: tableName,
    Key: keys.order(orderId),
    UpdateExpression:
      "SET paymentStatus = :paymentStatus, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":paymentStatus": paymentStatus,
      ":updatedAt": new Date().toISOString(),
    },
  });

  await docClient.send(command);
};

/**
 * Updates both order status and payment status atomically
 *
 * Useful when a payment event triggers both status changes.
 *
 * @param ctx - Repository context with tableName and docClient
 * @param orderId - The order ID to update
 * @param orderStatus - The new order status
 * @param paymentStatus - The new payment status
 * @param config - Optional key generator configuration
 *
 * @example
 * ```typescript
 * import { updateOrderStatusAndPayment } from "@grantfs/store-toolbox-orders/dynamodb";
 *
 * await updateOrderStatusAndPayment(
 *   ctx,
 *   "ORD-123",
 *   OrderStatus.CONFIRMED,
 *   PaymentStatus.SUCCEEDED
 * );
 * ```
 */
export const updateOrderStatusAndPayment = async (
  ctx: RepositoryContext,
  orderId: string,
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
  config?: OrderKeyGeneratorConfig
): Promise<void> => {
  const { tableName, docClient } = ctx;

  if (!docClient) {
    throw new Error("docClient is required in RepositoryContext");
  }

  const keys = createOrderKeyGenerators(config);

  const command = new UpdateCommand({
    TableName: tableName,
    Key: keys.order(orderId),
    UpdateExpression:
      "SET #status = :orderStatus, paymentStatus = :paymentStatus, updatedAt = :updatedAt",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":orderStatus": orderStatus,
      ":paymentStatus": paymentStatus,
      ":updatedAt": new Date().toISOString(),
    },
  });

  await docClient.send(command);
};
