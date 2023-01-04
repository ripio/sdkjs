[![codecov](https://codecov.io/github/ripio/sdkjs/branch/main/graph/badge.svg?token=CTSO4X4EIP)](https://codecov.io/github/ripio/sdkjs)

# Setup

## Install node

**Recommended version: 16.14.0 (LTS)**

- **Mac OS:** You can download it from `https://nodejs.org/en/`
- **Linux:** follow instructions `https://nodejs.org/en/download/package-manager/` or use a version manager like nvm `https://github.com/nvm-sh/nvm`

## Install dependencies

```bash
npm install
```

## Run tests

```bash
npm run test
```

## Development console

## Ts-node

Interactive shell to test features or just run code

```bash
npx ts-node
```

# Deploy a new version of the sdk

The deploys are automatically done by merging using semantic-release.

Follow the [commit style guide](https://github.com/semantic-release/semantic-release#how-does-it-work) so the commits will be added to the changelog.

# Documentation

Read the [docs](https://ripio.github.io/sdkjs) on github pages.

- [sdk](https://ripio.github.io/sdkjs/sdk/v2.0.0)
- [sdk nft](https://ripio.github.io/sdkjs/sdk-nft/v1.0.0)
- [sdk storage aws](https://ripio.github.io/sdkjs/sdk-storage-aws/v1.0.0)
- [sdk storage http](https://ripio.github.io/sdkjs/sdk-storage-http/v1.0.0)
- [sdk storage ipfs](https://ripio.github.io/sdkjs/sdk-storage-ipfs/v1.0.0)