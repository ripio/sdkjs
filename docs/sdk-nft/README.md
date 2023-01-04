## Installation

To install ripio sdk-nft we recommend node 16 or above, although it might work with lower versions.

```
npm install @ripio/sdk-nft
```

## Overview

### NFT

Class to represent a NFT

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-6725d38f-7fff-9d4e-b2e8-b435539120c7"><div dir="ltr" style="margin-left:0pt;" align="left">
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
</div><br /></b>

#### NFTFactory

Given a NFT721Manager, a StorageType (StorageIpfs, StorageAws, StorageHttp) and a NFT_METADATA_FORMAT, it creates a NFTFactory instance to interact with NFTs

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-6725d38f-7fff-9d4e-b2e8-b435539120c7"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
// commonJS
const { NFTFactory } = require('@rgc/sdk');
// TS
import { NFTFactory } from '@rgc/sdk';
// Create NFTFactory instance
const nftFactory = new NFTFactory(NFT_MANAGER, STORAGE, FORMAT);
```
</div><br /></b>

Where:

- NFT_MANAGER is a NFT721Manager instance activated
- STORAGE is a StorageIpfs, StorageAws or StorageHttp instance
- FORMAT is a NFT_METADATA_FORMAT enum (IMAGE, JSON, JSON_WITH_IMAGE)

NFTFactory methods:

- createNFT:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-3ad13627-7fff-8080-cb26-bc5f83557428"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
nftFactory.createNFT("aTokenId");
NFT {...} // NFT instance
````

</div><br /></b>
