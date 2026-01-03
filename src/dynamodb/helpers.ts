import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { RepositoryContext } from "@grantfs/store-toolbox-core";
import type { OrderStatus } from "../types";
import { PaymentStatus } from "../types";
import { createOrderKeyGenerators, type OrderKeyGeneratorConfig } from "./keys";
import { validateRepositoryContext, getCurrentTimestamp } from "./utils";

export const updateOrderPaymentStatus = async (
  ctx: RepositoryContext,
  orderId: string,
  paymentStatus: PaymentStatus,
  config?: OrderKeyGeneratorConfig
): Promise<void> => {
  validateRepositoryContext(ctx);

  const keys = createOrderKeyGenerators(config);

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

  await ctx.docClient!.send(command);
};

export const updateOrderStatusAndPayment = async (
  ctx: RepositoryContext,
  orderId: string,
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
  config?: OrderKeyGeneratorConfig
): Promise<void> => {
  validateRepositoryContext(ctx);

  const keys = createOrderKeyGenerators(config);

  const command = new UpdateCommand({
    TableName: ctx.tableName,
    Key: keys.order(orderId),
    UpdateExpression:
      "SET #status = :orderStatus, paymentStatus = :paymentStatus, updatedAt = :updatedAt",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":orderStatus": orderStatus,
      ":paymentStatus": paymentStatus,
      ":updatedAt": getCurrentTimestamp(),
    },
  });

  await ctx.docClient!.send(command);
};
