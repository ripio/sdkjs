## Installation

To install ripio sdk-modal-connector we recommend node 16 or above, although it might work with lower versions.

```
npm install @ripio/sdk-modal-connector
```

Head over to [WalletConnect Cloud](https://cloud.walletconnect.com/) to sign in or sign up. Create (or use an existing) project and copy its associated project id

## Overview

### ModalConnector

ModalConnector is a class that allows users to interact with the blockchain using the [Web3Modal library](https://docs.walletconnect.com/2.0/web3modal/about). It provides methods for activating and deactivating the connector, requesting an account, switching chains, and subscribing to and unsubscribing from events. ModalConnector extends AbstractWeb3Connector, a class from the [@ripio/sdk](https://ripio.github.io/sdkjs/sdk/) package.

```javascript
// commonJS
const { ModalConnector } = require('@ripio/sdk-modal-connector')
// TS
import { ModalConnector } from '@ripio/sdk-modal-connector'
```

- Constructor

  The ModalConnector constructor takes three arguments:

  - projectId (string): The project ID for the WalletConnect service.
  - [chains](#chains) (Chain[] | Chain): An array of Chain objects, or a single Chain object, representing the chains the connector will support. Defaults to the mainnet Chain object.
  - requestAccount (boolean): Whether to request an account when activating the connector. Defaults to true.

```javascript
const connector = new ModalConnector(projectId, chains, requestAccount)
```

- `activate()`: Activates the provider, sets the chain ID, requests an account (if requestAccount is true), subscribes to events, and detects the legacy chain. Returns an object with the provider, chain ID, and account.

```javascript
await connector.activate()
```

- `deactivate()`: Deactivates the connector, unsubscribes from events, and disconnects from the Web3Modal and Wagmi Core clients.

```javascript
await connector.deactivate()
```

- `requestAccount()`: If the user is already connected to a wallet, fetches the signer. Otherwise, opens the Web3Modal.

```javascript
await connector.requestAccount()
```

- `switchChain(chainId: number)`: Switches the current chain to the one specified by the user.

```javascript
await connector.switchChain(5)
```

- `subscribeToEvents()`: Subscribes to events related to account changes, network changes, and provider changes.

```javascript
await connector.subscribeToEvents()
```

- `unsubscribeFromEvents()`: Unsubscribes from all events.

```javascript
await connector.unsubscribeFromEvents()
```

### Chains

- Import your chains and use them in your app:

```javascript
import { avalanche, bsc, mainnet } from '@ripio/sdk-wc-connector/chains'
```

- Build your own

  You can also support other EVM-compatible chains by building your own chain object that inherits the Chain type.

```javascript
import { Chain } from '@ripio/sdk-wc-connector/chains'

export const avalanche = {
  id: 43_114,
  name: 'Avalanche',
  network: 'avalanche',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche',
    symbol: 'AVAX',
  },
  rpcUrls: {
    public: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
    default: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 11_907_934,
    },
  },
} as const satisfies Chain
```

### Other resources

- [sdk](https://ripio.github.io/sdkjs/sdk)
- [sdk nft](https://ripio.github.io/sdkjs/sdk-nft)
- [sdk storage aws](https://ripio.github.io/sdkjs/sdk-storage-aws)
- [sdk storage http](https://ripio.github.io/sdkjs/sdk-storage-http)
- [sdk storage ipfs](https://ripio.github.io/sdkjs/sdk-storage-ipfs)
