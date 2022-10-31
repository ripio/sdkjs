/* eslint-disable @typescript-eslint/no-explicit-any */
import ResourceAws from './ResourceAws'
import StorageType from './StorageType'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

export default class StorageAws implements StorageType {
  readonly storage: S3Client
  readonly bucketName: string

  /**
   * It creates a new StorageAws object with a conection to aws s3, which is used to interact with the S3 bucket
   * @param {string} bucketName - The name of the bucket you want to upload/download to/from.
   * @param {string} region - The region where the bucket is located.
   */
  constructor(bucketName: string, region: string) {
    // It uses environment variables for credentials (authentication).
    // Must have set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
    this.storage = new S3Client({ region: region })
    this.bucketName = bucketName
  }

  /**
   * It takes a fileId, and returns a ResourceAws object
   * @param {string} fielId - The name of the file you want to retrieve.
   * @returns A ResourceAws object
   */
  async getData(resourceId: string): Promise<ResourceAws> {
    const bucketParams = { Bucket: this.bucketName, Key: resourceId }
    const data = await this.storage.send(new GetObjectCommand(bucketParams))
    return new ResourceAws(data)
  }
}
