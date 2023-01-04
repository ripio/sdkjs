## Installation

To install ripio sdk-storage-aws we recommend node 16 or above, although it might work with lower versions.

```
npm install @ripio/sdk-storage-aws
```

## Overview

### StorageAws

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
