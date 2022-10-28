/* eslint-disable @typescript-eslint/no-explicit-any */
import ResourceAws from './ResourceAws'
import StorageType from './StorageType'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

export default class StorageAws implements StorageType {
  storage: any
  bucketName: string

  constructor(resourceName: string, region: string) {
    this.storage = new S3Client({ region: region })
    this.bucketName = resourceName
  }

  /**
   * It takes a fileId, and returns a ResourceAws object
   * @param {string} fielId - The name of the file you want to retrieve.
   * @returns A ResourceAws object
   */
  async getData(fielId: string): Promise<ResourceAws> {
    const bucketParams = { Bucket: this.bucketName, Key: fielId }
    const data = await this.storage.send(new GetObjectCommand(bucketParams))
    const resource = new ResourceAws(data)
    await resource.parseData()
    return resource
  }
}
