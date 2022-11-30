# Intro
#### What is Ripio SDK js?

Ripio SDK js is a library written in javascript that allows you to interact with any EVM. As a main feature, Ripio SDK grants simplicity in writing code to transact on blockchain. It has 3 layers of abstraction that goes from, the most generic in terms of interaction with Smart Contracts, to a more oriented design for each of the use cases/industries where you can develop a dApp. Ripio SDK js uses Ethers js to perform the interaction with the blockchain while simplifying its use.

#### Disclaimer
This repository is still a "work in progress", we appreciate any feedback you can provide us.

Please be polite and respectful when creating issues.

# Getting started
### Install
```bash
npm install @ripio/sdk
```

### Documentation
Read the [docs](https://github.com/ripio/sdkjs/wiki) in our project's wiki.
- [Intro](https://github.com/ripio/sdkjs/wiki/1.-Intro)
- [Getting started](https://github.com/ripio/sdkjs/wiki/2.-Getting-started)
- [Overview](https://github.com/ripio/sdkjs/wiki/3.-Overview)

# Developement documentation
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

Later, during the CI (in develop and main branches) a new package version will be created and uploaded to npmjs registry.

# License
Apache 2.0