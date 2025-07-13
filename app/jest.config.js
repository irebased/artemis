/** @type {import("jest").Config} **/
const { defaults: tsjPreset } = require("ts-jest/presets");

const tsJestTransformCfg = tsjPreset.transform;

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    ...tsJestTransformCfg,
  },
  testPathIgnorePatterns: [
    '<rootDir>/src-tauri/',
    '<rootDir>/node_modules/'
  ],
  collectCoverageFrom: [
    'app/tools/**/*.{ts,tsx}',
    'app/utils/**/*.{ts,tsx}',
    'app/types/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/*.test.{ts,tsx}',
    '!app/**/*.spec.{ts,tsx}',
    '!app/**/*.jsx',
    '!app/**/*.tsx',
    '!app/src-tauri/**',
    '!app/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/app/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/app/**/*.{test,spec}.{ts,tsx}'
  ]
};