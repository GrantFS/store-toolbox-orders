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
  PaymentStatus,
} from "../types";
import {
  createOrderKeyGenerators,
  type OrderKeyGeneratorConfig,
  type OrderKeyGenerators,
} from "./keys";
import {
  assertValidRepositoryContext,
  getCurrentTimestamp,
  type ValidatedRepositoryContext,
} from "./utils";

export interface DynamoOrderRepositoryConfig extends OrderKeyGeneratorConfig {
  entityTypes?: {
    order?: string;
  };
  gsiIndexes?: {
    gsi1?: string;
  };
}

interface RepositoryDependencies {
  ctx: ValidatedRepositoryContext;
  keys: OrderKeyGenerators;
  entityType: string;
  gsi1IndexName: string;
}

const DEFAULT_ENTITY_TYPE = "ORDER";
const DEFAULT_GSI1_INDEX = "gsi1";

function buildDependencies(
  ctx: RepositoryContext,
  config?: DynamoOrderRepositoryConfig
): RepositoryDependencies {
  assertValidRepositoryContext(ctx);

  return {
    ctx,
    keys: createOrderKeyGenerators(config),
    entityType: config?.entityTypes?.order ?? DEFAULT_ENTITY_TYPE,
    gsi1IndexName: config?.gsiIndexes?.gsi1 ?? DEFAULT_GSI1_INDEX,
  };
}

async function saveOrder(
  deps: RepositoryDependencies,
  order: Order
): Promise<void> {
  const { ctx, keys, entityType } = deps;

  const command = new PutCommand({
    TableName: ctx.tableName,
    Item: {
      ...order,
      ...keys.order(order.orderId),
      ...keys.orderByCustomer(order.customerId, order.createdAt),
      entityType,
    },
  });

  await ctx.docClient.send(command);
}

async function findOrderById(
  deps: RepositoryDependencies,
  orderId: string
): Promise<Order | null> {
  const { ctx, keys } = deps;

  const command = new GetCommand({
    TableName: ctx.tableName,
    Key: keys.order(orderId),
  });

  const result = await ctx.docClient.send(command);
  return (result.Item as Order | undefined) ?? null;
}

async function findOrdersByCustomerId(
  deps: RepositoryDependencies,
  customerId: string,
  options?: OrderQueryOptions
): Promise<Order[]> {
  const { ctx, keys, gsi1IndexName } = deps;

  const command = new QueryCommand({
    TableName: ctx.tableName,
    IndexName: gsi1IndexName,
    KeyConditionExpression: "gsi1pk = :pk AND begins_with(gsi1sk, :sk)",
    ExpressionAttributeValues: {
      ":pk": `${keys.prefixes.customer}#${customerId}`,
      ":sk": `${keys.prefixes.order}#`,
    },
    ScanIndexForward: false,
    Limit: options?.limit,
    ExclusiveStartKey: options?.cursor
      ? JSON.parse(Buffer.from(options.cursor, "base64").toString())
      : undefined,
  });

  const result = await ctx.docClient.send(command);
  return (result.Items as Order[]) ?? [];
}

async function updateOrderStatus(
  deps: RepositoryDependencies,
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const { ctx, keys } = deps;

  const command = new UpdateCommand({
    TableName: ctx.tableName,
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

  await ctx.docClient.send(command);
}

async function updateOrderPaymentStatus(
  deps: RepositoryDependencies,
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<void> {
  const { ctx, keys } = deps;

  const command = new UpdateCommand({
    TableName: ctx.tableName,
    Key: keys.order(orderId),
    UpdateExpression:
      "SET paymentStatus = :paymentStatus, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":paymentStatus": paymentStatus,
      ":updatedAt": getCurrentTimestamp(),
    },
  });

  await ctx.docClient.send(command);
}

export function createDynamoOrderRepository(
  ctx: RepositoryContext,
  config?: DynamoOrderRepositoryConfig
): OrderRepository {
  const deps = buildDependencies(ctx, config);

  return {
    save: (order) => saveOrder(deps, order),
    findById: (orderId) => findOrderById(deps, orderId),
    findByCustomerId: (customerId, options) =>
      findOrdersByCustomerId(deps, customerId, options),
    updateStatus: (orderId, status) => updateOrderStatus(deps, orderId, status),
    updatePaymentStatus: (orderId, paymentStatus) =>
      updateOrderPaymentStatus(deps, orderId, paymentStatus),
  };
}
