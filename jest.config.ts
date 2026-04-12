import type {JestConfigWithTsJest} from 'ts-jest';

const config: JestConfigWithTsJest = {
    preset: 'ts-jest',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    verbose: true,
};

export default config;