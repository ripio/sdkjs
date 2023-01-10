## Installation

To install ripio sdk-storage-ipfs we recommend node 16 or above, although it might work with lower versions.

```
npm install @ripio/sdk-storage-ipfs
```

## Overview

### StorageIpfs

When working with NFTs a good practice is to store your NFTs data on Ipfs, which is a protocol and peer-to-peer network for storing and sharing data in a distributed file system. For this reason a StorageIpfs class is given:

```javascript
// commonJS
const { StorageIpfs } = require('@rgc/sdk');
// TS
import { StorageIpfs } from '@rgc/sdk';
// Create StorageIpfs instance
const ipfs = new StorageIpfs(IPFS_URL);
```

Where IPFS_URL is the api gateway to a node.

The StorageIpfs class arranges a variety of methods to interact with the ipfs nodes:

- storeFile:

```javascript
await ipfs.storeFile(“./images/cat.png”);
‘Qmj…Ehb’ // CID of the file
```

- storeMetadata:

```javascript
const data = {image: 'QmP…Weh', {description: ‘Marvin the Paranoid Android’} };
await ipfs.storeMetadata(data);
‘Qmj…Ehb’
```

- getStringData:

```javascript
const resource = await ipfs.getData(‘Qmj…Ehb’);
await resource.getStringData();
‘Marvin the Paranoid Android’
```

- getJsonData:

```javascript
const resource = await ipfs.getData(‘Qmj…Ehb’);
await resource.getJsonData();
{image: 'ipfs://fake-uri/image.png', level: 42, name: 'Marvin'}
```

- getBase64Data:

```javascript
const resource = await ipfs.getData(‘Qmj…Ehb’);
await resource.getBase64Data();
‘RWwgc2VudGlkbyBkZSBsYSB2aWRhLCBlbCB1bml2ZXJzbyB5IHRvZG8gbG8gZGVtw6Fz’
```

### Other resources

- [sdk](https://ripio.github.io/sdkjs/sdk)
- [sdk nft](https://ripio.github.io/sdkjs/sdk-nft)
- [sdk storage aws](https://ripio.github.io/sdkjs/sdk-storage-aws)
- [sdk storage http](https://ripio.github.io/sdkjs/sdk-storage-http)