## Installation

To install ripio sdk-storage-ipfs we recommend node 16 or above, although it might work with lower versions.

```
npm install @ripio/sdk-storage-ipfs
```

## Overview

### StorageIpfs

When working with NFTs a good practice is to store your NFTs data on Ipfs, which is a protocol and peer-to-peer network for storing and sharing data in a distributed file system. For this reason a StorageIpfs class is given:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-6725d38f-7fff-9d4e-b2e8-b435539120c7"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
// commonJS
const { StorageIpfs } = require('@rgc/sdk');
// TS
import { StorageIpfs } from '@rgc/sdk';
// Create StorageIpfs instance
const ipfs = new StorageIpfs(IPFS_URL);
```
</div><br /></b>

Where IPFS_URL is the api gateway to a node.

The StorageIpfs class arranges a variety of methods to interact with the ipfs nodes:

- storeFile:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-3ad13627-7fff-8080-cb26-bc5f83557428"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
await ipfs.storeFile(“./images/cat.png”);
‘Qmj…Ehb’ // CID of the file
````

</div><br /></b>

- storeMetadata:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-25c3ed67-7fff-caa3-8c67-930792799317"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const data = {image: 'QmP…Weh', {description: ‘Marvin the Paranoid Android’} };
await ipfs.storeMetadata(data);
‘Qmj…Ehb’
```
</div><br /></b>

- getStringData:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-35c21b9b-7fff-c6fb-6496-c256f139be5f"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const resource = await ipfs.getData(‘Qmj…Ehb’);
await resource.getStringData();
‘Marvin the Paranoid Android’
```
</div><br /></b>

- getJsonData:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-35c21b9b-7fff-c6fb-6496-c256f139be5f"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const resource = await ipfs.getData(‘Qmj…Ehb’);
await resource.getJsonData();
{image: 'ipfs://fake-uri/image.png', level: 42, name: 'Marvin'}
```
</div><br /></b>

- getBase64Data:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-b13142e1-7fff-52d6-fb3d-606d4e04de57"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const resource = await ipfs.getData(‘Qmj…Ehb’);
await resource.getBase64Data();
‘RWwgc2VudGlkbyBkZSBsYSB2aWRhLCBlbCB1bml2ZXJzbyB5IHRvZG8gbG8gZGVtw6Fz’
```
</div><br /></b>

#### StorageAws

You can also store your NFTs data on Aws S3 Buckets. For this reason a StorageAws class is given:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-6725d38f-7fff-9d4e-b2e8-b435539120c7"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
// commonJS
const { StorageAws } = require('@rgc/sdk');
// TS
import { StorageAws } from '@rgc/sdk';
// Create StorageAws instance
const aws = new StorageAws('sa-east-1');
```
</div><br /></b>

The StorageAws class arranges a variety of methods to interact:

- storeFile:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-3ad13627-7fff-8080-cb26-bc5f83557428"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
await aws.storeFile(“./images/cat.png”);
‘cat.png’
````

</div><br /></b>

- storeMetadata:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-25c3ed67-7fff-caa3-8c67-930792799317"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const data = {image: 'QmP…Weh', {description: ‘Marvin the Paranoid Android’} };
await aws.storeMetadata(data);
‘metada.json’
```
</div><br /></b>

- getStringData:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-35c21b9b-7fff-c6fb-6496-c256f139be5f"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const resource = await aws.getData(‘text.txt’);
await resource.getStringData();
‘Marvin the Paranoid Android’
```
</div><br /></b>

- getJsonData:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-35c21b9b-7fff-c6fb-6496-c256f139be5f"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const resource = await aws.getData(‘metadata.json’);
await resource.getJsonData();
{image: 'aws://fake-uri/image.png', level: 42, name: 'Marvin'}
```
</div><br /></b>

- getBase64Data:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-b13142e1-7fff-52d6-fb3d-606d4e04de57"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const resource = await aws.getData(‘cat.png’);
await resource.getBase64Data();
‘RWwgc2VudGlkbyBkZSBsYSB2aWRhLCBlbCB1bml2ZXJzbyB5IHRvZG8gbG8gZGVtw6Fz’
```
</div><br /></b>
