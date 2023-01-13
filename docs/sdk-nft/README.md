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
const { NFT } = require('@rgc/sdk');
// TS
import { NFT } from '@rgc/sdk';
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

### NFTImageFactory

- createNFT:

Static method that, given a Resource (which returns an image) and a tokenId, it returns an NFT instance.

```javascript
// commonJS
const { NFTImageFactory } = require('@rgc/sdk');
// TS
import { NFTImageFactory } from '@rgc/sdk';

NFTImageFactory.createNFT(RESOURCE, "aTokenId");
NFT {...} // NFT instance
```
Where:

- RESOURCE is a ResourceIpfs, ResourceAws or ResourceHttp instance that contains an image.

### NFTJsonFactory

- createNFT:

Static method that, given a Resource (which returns a JSON) and a tokenId, it returns an NFT instance.

```javascript
// commonJS
const { NFTJsonFactory } = require('@rgc/sdk');
// TS
import { NFTJsonFactory } from '@rgc/sdk';

NFTJsonFactory.createNFT(RESOURCE, "aTokenId");
NFT {...} // NFT instance
```
Where:

- RESOURCE is a ResourceIpfs, ResourceAws or ResourceHttp instance that contains a JSON.

### NFTJsonImageFactory

- createNFT:

Static method that, given a Resource (which returns a JSON), a tokenId and a a StorageType, it returns an NFT instance.

```javascript
// commonJS
const { NFTJsonImageFactory } = require('@rgc/sdk');
// TS
import { NFTJsonImageFactory } from '@rgc/sdk';

NFTJsonImageFactory.createNFT(RESOURCE, "aTokenId", STORAGE);
NFT {...} // NFT instance
```
Where:

- RESOURCE is a ResourceIpfs, ResourceAws or ResourceHttp instance that contains a JSON.
- STORAGE is a StorageIpfs, StorageAws or StorageHttp instance

### Other resources

- [sdk](https://ripio.github.io/sdkjs/sdk)
- [sdk storage aws](https://ripio.github.io/sdkjs/sdk-storage-aws)
- [sdk storage http](https://ripio.github.io/sdkjs/sdk-storage-http)
- [sdk storage ipfs](https://ripio.github.io/sdkjs/sdk-storage-ipfs)