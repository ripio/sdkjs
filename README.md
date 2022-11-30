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
