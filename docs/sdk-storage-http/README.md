## Installation

To install ripio sdk-storage-http we recommend node 16 or above, although it might work with lower versions.

```
npm install @ripio/sdk-storage-http
```

## Overview

### StorageHttp

Get NFTs data on Aws S3 Buckets with http. For that, a StorageHttp class is given:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-6725d38f-7fff-9d4e-b2e8-b435539120c7"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
// commonJS
const { StorageHttp } = require('@rgc/sdk');
// TS
import { StorageHttp } from '@rgc/sdk';
// Create StorageHttp instance
const client = new StorageHttp();
```
</div><br /></b>

The StorageHttp class arranges a variety of methods to interact:

- getStringData:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-35c21b9b-7fff-c6fb-6496-c256f139be5f"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const resource = await client.getData(‘https://text.txt’);
await resource.getStringData();
‘Marvin the Paranoid Android’
````

</div><br /></b>

- getJsonData:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-35c21b9b-7fff-c6fb-6496-c256f139be5f"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const resource = await client.getData(‘https://metadata.json’);
await resource.getJsonData();
{image: 'aws://fake-uri/image.png', level: 42, name: 'Marvin'}
```
</div><br /></b>

- getBase64Data:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-b13142e1-7fff-52d6-fb3d-606d4e04de57"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const resource = await client.getData(‘https://cat.png’);
await resource.getBase64Data();
‘RWwgc2VudGlkbyBkZSBsYSB2aWRhLCBlbCB1bml2ZXJzbyB5IHRvZG8gbG8gZGVtw6Fz’
```
</div><br /></b>