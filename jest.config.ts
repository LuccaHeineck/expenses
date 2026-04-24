import type {JestConfigWithTsJest} from 'ts-jest';

const config: JestConfigWithTsJest = {
    preset: 'ts-jest',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
    collectCoverage: false,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    verbose: true,
};

export default config;