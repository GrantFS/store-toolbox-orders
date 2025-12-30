/**
 * DynamoDB Order Repository Factory
 *
 * Creates a DynamoDB implementation of OrderRepository using the
 * RepositoryContext pattern for dependency injection.
 */

import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type { RepositoryContext } from "@grantfs/store-toolbox-core";
import type {
  Order,
  OrderRepository,
  OrderStatus,
  OrderQueryOptions,
} from "../types";
import { PaymentStatus } from "../types";
import { createOrderKeyGenerators, type OrderKeyGeneratorConfig } from "./keys";

interface GetCommandResult {
  Item?: Record<string, unknown>;
}

interface QueryCommandResult {
  Items?: Record<string, unknown>[];
  LastEvaluatedKey?: Record<string, unknown>;
}

export interface DynamoOrderRepositoryConfig extends OrderKeyGeneratorConfig {
  entityTypes?: {
    order?: string;
  };

  gsiIndexes?: {
    gsi1?: string;
  };
}

const DEFAULT_ENTITY_TYPES = {
  order: "ORDER",
};

const DEFAULT_GSI_INDEXES = {
  gsi1: "gsi1",
};

/**
 * Creates a DynamoDB implementation of OrderRepository
 *
 * @param ctx - Repository context with tableName and docClient
 * @param config - Optional configuration for keys, entity types, and GSI names
 * @returns OrderRepository implementation
 *
 * @example
 * ```typescript
 * import { createDynamoOrderRepository } from "@grantfs/store-toolbox-orders/dynamodb";
 *
 * const repository = createDynamoOrderRepository(getRepositoryContext());
 * const order = await repository.findById("ORD-123");
 * ```
 */
export const createDynamoOrderRepository = (
  ctx: RepositoryContext,
  config?: DynamoOrderRepositoryConfig
): OrderRepository => {
  const { tableName, docClient } = ctx;

  if (!docClient) {
    throw new Error("docClient is required in RepositoryContext");
  }

  const keys = createOrderKeyGenerators(config);
  const entityTypes = { ...DEFAULT_ENTITY_TYPES, ...config?.entityTypes };
  const gsiIndexes = { ...DEFAULT_GSI_INDEXES, ...config?.gsiIndexes };

  const getCurrentTimestamp = () => new Date().toISOString();

  return {
    async save(order: Order): Promise<void> {
      const command = new PutCommand({
        TableName: tableName,
        Item: {
          ...order,
          ...keys.order(order.orderId),
          ...keys.orderByCustomer(order.customerId, order.createdAt),
          entityType: entityTypes.order,
        },
      });

      await docClient.send(command);
    },

    async findById(orderId: string): Promise<Order | null> {
      const command = new GetCommand({
        TableName: tableName,
        Key: keys.order(orderId),
      });

      const result = (await docClient.send(command)) as GetCommandResult;
      return result.Item ? (result.Item as unknown as Order) : null;
    },

    async findByCustomerId(
      customerId: string,
      _options?: OrderQueryOptions
    ): Promise<Order[]> {
      const command = new QueryCommand({
        TableName: tableName,
        IndexName: gsiIndexes.gsi1,
        KeyConditionExpression: "gsi1pk = :pk AND begins_with(gsi1sk, :sk)",
        ExpressionAttributeValues: {
          ":pk": `${keys.prefixes.customer}#${customerId}`,
          ":sk": `${keys.prefixes.order}#`,
        },
        ScanIndexForward: false,
      });

      const result = (await docClient.send(command)) as QueryCommandResult;
      return (result.Items as unknown as Order[]) || [];
    },

    async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
      const command = new UpdateCommand({
        TableName: tableName,
        Key: keys.order(orderId),
        UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":updatedAt": getCurrentTimestamp(),
        },
      });

      await docClient.send(command);
    },

    async updatePaymentStatus(
      orderId: string,
      paymentStatus: PaymentStatus
    ): Promise<void> {
      const command = new UpdateCommand({
        TableName: tableName,
        Key: keys.order(orderId),
        UpdateExpression:
          "SET paymentStatus = :paymentStatus, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":paymentStatus": paymentStatus,
          ":updatedAt": getCurrentTimestamp(),
        },
      });

      await docClient.send(command);
    },
  };
};
