import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { RepositoryContext } from "@grantfs/store-toolbox-core";

export interface ValidatedRepositoryContext extends RepositoryContext {
  docClient: DynamoDBDocumentClient;
}

// eslint-disable-next-line func-style -- TypeScript assertion functions require function declarations
export function assertValidRepositoryContext(
  ctx: RepositoryContext
): asserts ctx is ValidatedRepositoryContext {
  if (!ctx.docClient) {
    throw new Error("docClient is required in RepositoryContext");
  }
}

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
