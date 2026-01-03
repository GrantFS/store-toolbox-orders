import type { RepositoryContext } from "@grantfs/store-toolbox-core";

export const validateRepositoryContext = (ctx: RepositoryContext): void => {
  if (!ctx.docClient) {
    throw new Error("docClient is required in RepositoryContext");
  }
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
