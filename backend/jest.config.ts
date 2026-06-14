import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',   // ✅ ESM preset
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.test.ts'],
  globalSetup: './tests/globalSetup.ts',
  globalTeardown: './tests/globalTeardown.ts',
  maxWorkers: 1,
  forceExit: true,
  extensionsToTreatAsEsm: ['.ts'],          // ✅ treat .ts as ESM
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',           // ✅ resolve import paths
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,                        // ✅ bật ESM cho ts-jest
        tsconfig: './tsconfig.test.json',
      },
    ],
  },
};

export default config;