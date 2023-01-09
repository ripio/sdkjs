import fs from 'fs/promises'
import StorageAws from '../StorageAws'
import ResourceAWS from '../ResourceAws'
import { SdkStream } from '@aws-sdk/types'
import {
  __resetS3ClientMocks,
  __setMockSend,
  GetObjectCommand,
  PutObjectCommand
} from '../__mocks__/@aws-sdk/client-s3'
import { PutObjectCommandOutput } from '@aws-sdk/client-s3'

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
  it('Should add a file with its properties and return the resource id', async () => {
    const spyReadFile = jest.spyOn(fs, 'readFile').mockImplementation(jest.fn())
    const expectedResourceId = 'resId'
    const path = '/a/path'
    const storage = new StorageAws('bucketName', 'region')
    storage['addFileToAws'] = jest.fn()
    storage['generateResourceId'] = jest.fn(() => expectedResourceId)
    const result = await storage.storeFile(path)

    expect(result).toBe(expectedResourceId)
    expect(storage['addFileToAws']).toBeCalled()
    expect(storage['generateResourceId']).toBeCalled()
    expect(spyReadFile).toBeCalledWith(path)
  })
})

describe('StorageAws storeBase64Image method', () => {
  it('Should add a file with its properties and return the resource id', async () => {
    const expectedResourceId = 'resId'
    const base64 = 'aBase64Image'
    const storage = new StorageAws('bucketName', 'region')
    storage['addFileToAws'] = jest.fn()
    storage['generateResourceId'] = jest.fn(() => expectedResourceId)
    const result = await storage.storeBase64Image(base64)

    expect(result).toBe(expectedResourceId)
    expect(storage['addFileToAws']).toBeCalled()
    expect(storage['generateResourceId']).toBeCalled()
  })
})

describe('StorageAws storeMetadata method', () => {
  it('Should add a json file with its properties and return the resource id', async () => {
    const spyStringify = jest.spyOn(JSON, 'stringify')
    const properties = { someProp: 'prop' }
    const expectedResourceId = 'resId'
    const storage = new StorageAws('bucketName', 'region')
    storage['addFileToAws'] = jest.fn()
    storage['generateResourceId'] = jest.fn(() => expectedResourceId)
    const result = await storage.storeMetadata(properties)

    expect(result).toBe(expectedResourceId)
    expect(spyStringify).toBeCalledWith(properties)
    expect(storage['addFileToAws']).toBeCalled()
    expect(storage['generateResourceId']).toBeCalled()
  })
})

describe('StorageAws addFileToAws method', () => {
  afterEach(() => {
    jest.clearAllMocks()
    __resetS3ClientMocks()
  })

  it('Should store the file and return a PutObjectCommandOutput', async () => {
    const key = 'key'
    const bucketName = 'test_bucket'
    const body = 'body'
    const params = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body
    })
    const retData = {} as PutObjectCommandOutput
    const mockData = jest.fn(() => retData)
    __setMockSend(mockData)
    const storage = new StorageAws(bucketName, 'region')
    const result = await storage['addFileToAws'](key, body)

    expect(result).toEqual(retData)
    expect(mockData).toHaveBeenCalledWith(params)
  })
})

describe('StorageAws generateResourceId method', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test.each([
    { overwriteFiles: true, extension: 'png', expected: 'test.png' },
    { overwriteFiles: true, extension: undefined, expected: 'test' },
    {
      overwriteFiles: false,
      extension: 'png',
      expected: 'test-1667846471039.png'
    },
    {
      overwriteFiles: false,
      extension: undefined,
      expected: 'test-1667846471039'
    }
  ])(
    'Should return the generated resource id when overwriteFiles is $overwriteFiles',
    ({ overwriteFiles, extension, expected }) => {
      jest.spyOn(Date, 'now').mockReturnValue(1667846471039)
      const storage = new StorageAws('bucketName', 'region', overwriteFiles)
      const result = storage['generateResourceId']('test', extension)
      expect(result).toBe(expected)
      overwriteFiles
        ? expect(Date.now).not.toBeCalled()
        : expect(Date.now).toBeCalled()
    }
  )
})

describe('StorageAws getters and setters', () => {
  it.each([true, false])(
    'Should return the _overwriteFiles property value (%s)',
    (value: boolean) => {
      const storage = new StorageAws('bucketName', 'region', value)
      expect(storage.overwriteFiles).toBe(value)
    }
  )

  it('Should set the _overwriteFiles property', () => {
    const storage = new StorageAws('bucketName', 'region')

    // default _overwriteFiles value
    expect(storage.overwriteFiles).toBe(false)
    storage.overwriteFiles = true
    expect(storage.overwriteFiles).toBe(true)
  })

  it('Should return the _metadataFileName property value', () => {
    const storage = new StorageAws('bucketName', 'region', false, 'newName')
    expect(storage.metadataFileName).toBe('newName')
  })

  it('Should set the _metadataFileName property', () => {
    const storage = new StorageAws('bucketName', 'region')

    // default _metadataFileName value
    expect(storage.metadataFileName).toBe('metadata')
    storage.metadataFileName = 'newName'
    expect(storage.metadataFileName).toBe('newName')
  })

  it('Should return the _imageFileName property value', () => {
    const storage = new StorageAws(
      'bucketName',
      'region',
      false,
      undefined,
      'newName'
    )
    expect(storage.imageFileName).toBe('newName')
  })

  it('Should set the _metadataFileName property', () => {
    const storage = new StorageAws('bucketName', 'region')
    storage.imageFileName = 'newName'
    expect(storage.imageFileName).toBe('newName')
  })
})
