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
    'utils/**/*.{ts,tsx}',
    'types/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
    '!**/*.jsx',
    '!**/*.tsx',
    '!src-tauri/**',
    '!node_modules/**'
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
    '<rootDir>/app/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/utils/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/types/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/components/**/*.{test,spec}.{ts,tsx}'
  ]
};