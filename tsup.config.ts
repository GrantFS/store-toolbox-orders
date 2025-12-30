import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    browser: 'src/browser.ts',
    dynamodb: 'src/dynamodb/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    '@grantfs/store-toolbox-core',
    '@aws-sdk/lib-dynamodb',
  ],
});
