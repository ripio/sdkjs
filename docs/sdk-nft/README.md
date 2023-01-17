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
const { NFT } = require('@rgc/sdk-nft');
// TS
import { NFT } from '@rgc/sdk-nft';
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
const { NFTImageFactory } = require('@rgc/sdk-nft');
// TS
import { NFTImageFactory } from '@rgc/sdk-nft';

await NFTImageFactory.createNFT(RESOURCE, "aTokenId");
NFT {...} // NFT instance
```
Where:

- RESOURCE is a ResourceIpfs, ResourceAws or ResourceHttp instance that contains an image.

### NFTJsonFactory

- createNFT:

Static method that, given a Resource (which returns a JSON) and a tokenId, it returns an NFT instance.

```javascript
// commonJS
const { NFTJsonFactory } = require('@rgc/sdk-nft');
// TS
import { NFTJsonFactory } from '@rgc/sdk-nft';

await NFTJsonFactory.createNFT(RESOURCE, "aTokenId");
NFT {...} // NFT instance
```
Where:

- RESOURCE is a ResourceIpfs, ResourceAws or ResourceHttp instance that contains a JSON.

### NFTJsonImageFactory

- createNFT:

Static method that, given a Resource (which returns a JSON), a tokenId and a StorageType, it returns an NFT instance that also used the StorageType to fetch the image data from the retrieved JSON.

```javascript
// commonJS
const { NFTJsonImageFactory } = require('@rgc/sdk-nft');
// TS
import { NFTJsonImageFactory } from '@rgc/sdk-nft';

await NFTJsonImageFactory.createNFT(RESOURCE, "aTokenId", STORAGE);
NFT {...} // NFT instance
```
Where:

- RESOURCE is a ResourceIpfs, ResourceAws or ResourceHttp instance that contains a JSON.
- STORAGE is a StorageIpfs, StorageAws or StorageHttp instance

### NFTHandler

Class to get, list, create and change NFTs.
```javascript
// commonJS
const { NFTHandler } = require('@rgc/sdk-nft');
// TS
import { NFTHandler } from '@rgc/sdk-nft';
```
NFTHandler methods:
- get:

Get an NFT for a token id.
```javascript
await NFTHandler.get(NFT_MANAGER, STORAGE, "aTokenId", FORMAT);
NFT {...} // NFT instance
```
Where:

- NFT_MANAGER is an activated NFT721Manager instance
- STORAGE is a StorageIpfs, StorageAws or StorageHttp instance
- FORMAT is a NFT_METADATA_FORMAT enum (IMAGE, JSON, JSON_WITH_IMAGE)
___
- getNFTListByOwner:

Get all the NFTs for an address.
```javascript
await NFTHandler.getNFTListByOwner(NFT_MANAGER, STORAGE, "ownerAddress", FORMAT);
NFT[] // NFT array
```
Where:

- NFT_MANAGER is an activated NFT721Manager instance
- STORAGE is a StorageIpfs, StorageAws or StorageHttp instance
- FORMAT is a NFT_METADATA_FORMAT enum (IMAGE, JSON, JSON_WITH_IMAGE)
---
- create:

Uploads the metadata and/or image to the Storage and creates the NFT on the contract.
```javascript
const params = {
    NFTMANAGER,
    STORAGE,
    NFTFORMAT,
    ADDRESS,
    TOKENID,
    NFTMETADATA,
    IMAGE,
    VALUE
};
await NFTHandler.create(params); // returns a ExecuteResponse
```
Where:

- NFT_MANAGER is an activated NFT721Manager instance
- STORAGE is a StorageIpfs or StorageAws instance
- NFTFORMAT is a NFT_METADATA_FORMAT enum (IMAGE, JSON, JSON_WITH_IMAGE)
- ADDRESS is the address of the NFT owner
- TOKENID (optional) is the token id of the NFT. This is not required if the contract has an autoincremental tokenId
- NFTMETADATA (optional) is a dict with the NFT metadata
- IMAGE (optional) is a base64 encoded string representing an image
- VALUE (optional) Amount to be provided when the contract function to mint an NFT is payable
---
- change:

Uploads the metadata and/or image to the Storage and sets a new token uri to the NFT on the contract.
```javascript
const params = {
    NFTMANAGER,
    STORAGE,
    NFTFORMAT,
    TOKENID,
    NFTMETADATA,
    IMAGE,
    VALUE
};
await NFTHandler.change(params); // returns a ExecuteResponse
```
Where:

- NFT_MANAGER is an activated NFT721Manager instance
- STORAGE is a StorageIpfs or StorageAws instance
- NFTFORMAT is a NFT_METADATA_FORMAT enum (IMAGE, JSON, JSON_WITH_IMAGE)
- TOKENID is the token id of the NFT
- NFTMETADATA (optional) is a dict with the NFT metadata
- IMAGE (optional) is a base64 encoded string representing an image
- VALUE (optional) Amount to be provided when the contract function to set a token uri is payable
---
- getLastNFTId:

It returns the last token id of an address.
```javascript
await NFTHandler.getLastNFTId(NFT_MANAGER, "ownerAddress");
"12" // tokenId
```
Where:

- NFT_MANAGER is an activated NFT721Manager instance
### Other resources

- [sdk](https://ripio.github.io/sdkjs/sdk)
- [sdk storage aws](https://ripio.github.io/sdkjs/sdk-storage-aws)
- [sdk storage http](https://ripio.github.io/sdkjs/sdk-storage-http)
- [sdk storage ipfs](https://ripio.github.io/sdkjs/sdk-storage-ipfs)