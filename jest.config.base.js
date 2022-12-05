/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['json', 'text', 'lcov', 'clover', 'cobertura'],
  preset: 'ts-jest',
  reporters: ['default', 'jest-junit'],
  testEnvironment: 'node'
}
