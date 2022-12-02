import StorageAws from '../StorageAws'
import { S3Client } from '@aws-sdk/client-s3'

jest.unmock('@aws-sdk/client-s3')

describe('StorageAws integration tests', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Should instantiate a StorageAws with an S3Client', async () => {
    const bucketName = 'test_bucket'
    const region = 'sa-east-1'
    const storage = new StorageAws(bucketName, region)
    expect(storage.bucketName).toEqual(bucketName)
    expect(storage.storage).toBeInstanceOf(S3Client)
    expect(await storage.storage.config.region()).toEqual(region)
  })
})
