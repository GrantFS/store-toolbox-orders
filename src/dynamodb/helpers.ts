import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { RepositoryContext } from "@grantfs/store-toolbox-core";
import type { OrderStatus, PaymentStatus } from "../types";
import { createOrderKeyGenerators, type OrderKeyGeneratorConfig } from "./keys";
import { assertValidRepositoryContext, getCurrentTimestamp } from "./utils";

export async function updateOrderStatusAndPayment(
  ctx: RepositoryContext,
  orderId: string,
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
  config?: OrderKeyGeneratorConfig
): Promise<void> {
  assertValidRepositoryContext(ctx);

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

  await ctx.docClient.send(command);
}
