import StorageAws from '../../../nft/storage/StorageAws'
import ResourceAWS from '../../../nft/storage/ResourceAws'
import { SdkStream } from '@aws-sdk/types'
import {
  __resetS3ClientMocks,
  __setMockSend,
  GetObjectCommand
} from '../../../__mocks__/@aws-sdk/client-s3'

describe('StorageAws getData method', () => {
  afterEach(() => {
    jest.clearAllMocks()
    __resetS3ClientMocks()
  })

  it('Should return a ResourceAws with the obtained data', async () => {
    const key = 'key'
    const data = {} as unknown as SdkStream<ReadableStream>
    const retData = { Body: data }
    const region = 'sa-east-1'
    const bucketName = 'test_bucket'
    const params = new GetObjectCommand({ Bucket: bucketName, Key: key })
    const mockData = jest.fn(() => retData)
    __setMockSend(mockData)
    const storage = new StorageAws(bucketName, region)
    const resource = await storage.getData(key)
    expect(resource).toBeInstanceOf(ResourceAWS)
    expect(resource.data).toEqual(retData)
    expect(mockData).toHaveBeenCalledWith(params)
  })
})

describe('StorageAws storeFile method', () => {
  it('Should throw an error due not implemented method', () => {
    const storage = new StorageAws('test_bucket', 'sa-east-1')
    expect(() => {
      storage.storeFile('filename')
    }).toThrow('Method not implemented.')
  })
})

describe('StorageAws storeMetadata method', () => {
  it('Should throw an error due not implemented method', () => {
    const storage = new StorageAws('test_bucket', 'sa-east-1')
    expect(() => {
      storage.storeMetadata({ test: 'test' })
    }).toThrow('Method not implemented.')
  })
})
