// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('./jest.config.base')

module.exports = {
  ...base,
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest'
  },
  projects: [
    '<rootDir>/packages/sdk',
    '<rootDir>/packages/nft',
    '<rootDir>/packages/storageAws',
    '<rootDir>/packages/storageHttp',
    '<rootDir>/packages/storageIpfs'
  ]
}
