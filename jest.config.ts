import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
      'ts-jest': {
        useESM: true,
      },
    },
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    extensionsToTreatAsEsm: ['.ts'],
};

export default config;