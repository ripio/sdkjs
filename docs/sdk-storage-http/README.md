## Installation

To install ripio sdk-storage-http we recommend node 16 or above, although it might work with lower versions.

```
npm install @ripio/sdk-storage-http
```

## Overview

### StorageHttp

Get NFTs data on Aws S3 Buckets with http. For that, a StorageHttp class is given:

```javascript
// commonJS
const { StorageHttp } = require('@ripio/sdk-storage-http');
// TS
import { StorageHttp } from '@ripio/sdk-storage-http';
// Create StorageHttp instance
const client = new StorageHttp();
```

The StorageHttp class arranges a variety of methods to interact:

- getStringData:

```javascript
const resource = await client.getData(‘https://text.txt’);
await resource.getStringData();
‘Marvin the Paranoid Android’
```

- getJsonData:

```javascript
const resource = await client.getData(‘https://metadata.json’);
await resource.getJsonData();
{image: 'aws://fake-uri/image.png', level: 42, name: 'Marvin'}
```

- getBase64Data:

```javascript
const resource = await client.getData(‘https://cat.png’);
await resource.getBase64Data();
‘RWwgc2VudGlkbyBkZSBsYSB2aWRhLCBlbCB1bml2ZXJzbyB5IHRvZG8gbG8gZGVtw6Fz’
```

### Other resources

- [sdk](https://ripio.github.io/sdkjs/sdk)
- [sdk nft](https://ripio.github.io/sdkjs/sdk-nft)
- [sdk storage aws](https://ripio.github.io/sdkjs/sdk-storage-aws)
- [sdk storage ipfs](https://ripio.github.io/sdkjs/sdk-storage-ipfs)