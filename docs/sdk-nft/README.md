## Installation

To install ripio sdk-nft we recommend node 16 or above, although it might work with lower versions.

```
npm install @ripio/sdk-nft
```

## Overview

### NFT

Class to represent a NFT

```javascript
// commonJS
const { NFT } = require('@ripio/sdk-nft');
// TS
import { NFT } from '@ripio/sdk-nft';
// Create NFT instance
const nft = new NFT({
    tokenId: '42',
    nftMetadata: {
        name: 'fake-name',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'ipfs://fake-uri',
        attributes: [
            {
                trait_type: 'fake-trait',
                value: 'fake-value'
            },
            {
                trait_type: 'fake-trait-2',
                value: 'fake-value'
            }
        ]
    }
});
// Access nft properties
nft.tokenId;
// 43
nft.name;
// 'fake-name'
nft.description;
// 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
nft.imageUri;
// 'ipfs://fake-uri'
nft.attributes;
// [
//   { trait_type: 'fake-trait', value: 'fake-value' },
//   { trait_type: 'fake-trait-2', value: 'fake-value' }
// ]
nft.jsonData;
// {
//   name: 'fake-name',
//   description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//   image: 'ipfs://fake-uri',
//   attributes: [
//     { trait_type: 'fake-trait', value: 'fake-value' },
//     { trait_type: 'fake-trait-2', value: 'fake-value' }
//   ]
// }
```

#### NFTFactory

Given a NFT721Manager, a StorageType (StorageIpfs, StorageAws, StorageHttp) and a NFT_METADATA_FORMAT, it creates a NFTFactory instance to interact with NFTs

```javascript
// commonJS
const { NFTFactory } = require('@ripio/sdk-nft');
// TS
import { NFTFactory } from '@ripio/sdk-nft';
// Create NFTFactory instance
const nftFactory = new NFTFactory(NFT_MANAGER, STORAGE, FORMAT);
```

Where:

- NFT_MANAGER is a NFT721Manager instance activated
- STORAGE is a StorageIpfs, StorageAws or StorageHttp instance
- FORMAT is a NFT_METADATA_FORMAT enum (IMAGE, JSON, JSON_WITH_IMAGE)

NFTFactory methods:

- createNFT:

```javascript
nftFactory.createNFT("aTokenId");
NFT {...} // NFT instance
```

### Other resources

- [sdk](https://ripio.github.io/sdkjs/sdk)
- [sdk storage aws](https://ripio.github.io/sdkjs/sdk-storage-aws)
- [sdk storage http](https://ripio.github.io/sdkjs/sdk-storage-http)
- [sdk storage ipfs](https://ripio.github.io/sdkjs/sdk-storage-ipfs)