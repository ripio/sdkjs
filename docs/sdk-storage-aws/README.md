## Installation

To install ripio sdk-storage-aws we recommend node 16 or above, although it might work with lower versions.

```
npm install @ripio/sdk-storage-aws
```

## Overview

### StorageAws

You can also store your NFTs data on Aws S3 Buckets. For this reason a StorageAws class is given:

```javascript
// commonJS
const { StorageAws } = require('@ripio/sdk-storage-aws');
// TS
import { StorageAws } from '@ripio/sdk-storage-aws';
// Create StorageAws instance
const aws = new StorageAws('sa-east-1');
```

The StorageAws class arranges a variety of methods to interact:

- storeFile:

```javascript
await aws.storeFile(“./images/cat.png”);
‘cat.png’
```

- storeMetadata:

```javascript
const data = {image: 'QmP…Weh', {description: ‘Marvin the Paranoid Android’} };
await aws.storeMetadata(data);
‘metada.json’
```

- getStringData:

```javascript
const resource = await aws.getData(‘text.txt’);
await resource.getStringData();
‘Marvin the Paranoid Android’
```
- getJsonData:

```javascript
const resource = await aws.getData(‘metadata.json’);
await resource.getJsonData();
{image: 'aws://fake-uri/image.png', level: 42, name: 'Marvin'}
```

- getBase64Data:

```javascript
const resource = await aws.getData(‘cat.png’);
await resource.getBase64Data();
‘RWwgc2VudGlkbyBkZSBsYSB2aWRhLCBlbCB1bml2ZXJzbyB5IHRvZG8gbG8gZGVtw6Fz’
```

### Other resources

- [sdk](https://ripio.github.io/sdkjs/sdk)
- [sdk nft](https://ripio.github.io/sdkjs/sdk-nft)
- [sdk storage http](https://ripio.github.io/sdkjs/sdk-storage-http)
- [sdk storage ipfs](https://ripio.github.io/sdkjs/sdk-storage-ipfs)
- [sdk modal connector](https://ripio.github.io/sdkjs/sdk-modal-connector)