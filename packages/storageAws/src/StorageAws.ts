import fs from 'fs/promises'
import path from 'path'
import ResourceAws from './ResourceAws'
import { StorageType } from '@ripio/sdk-nft'
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput
} from '@aws-sdk/client-s3'

export default class StorageAws implements StorageType {
  readonly storage: S3Client
  readonly bucketName: string
  private _overwriteFiles: boolean
  private _metadataFileName: string

  /**
   * It creates a new StorageAws object with a conection to aws s3, which is used to interact with the S3 bucket
   * @param {string} bucketName - The name of the bucket you want to upload/download to/from.
   * @param {string} region - The region where the bucket is located.
   * @param {boolean} overwriteFiles - If true, it will overwrite files with the same name.
   * @param {string} metadataFileName - The name of the file that will be used to store the metadata.
   */
  constructor(
    bucketName: string,
    region: string,
    overwriteFiles = false,
    metadataFileName = 'metadata'
  ) {
    // It uses environment variables for credentials (authentication).
    // Must have set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
    this.storage = new S3Client({ region: region })
    this.bucketName = bucketName
    this._overwriteFiles = overwriteFiles
    this._metadataFileName = metadataFileName
  }

  // getters & setters
  get overwriteFiles(): boolean {
    return this._overwriteFiles
  }

  set overwriteFiles(overwriteFiles: boolean) {
    this._overwriteFiles = overwriteFiles
  }

  get metadataFileName(): string {
    return this._metadataFileName
  }

  set metadataFileName(metadataFileName: string) {
    this._metadataFileName = metadataFileName
  }
  // end getters & setters

  async storeFile(filepath: string): Promise<string> {
    const resourceId = this.generateResourceId(
      path.basename(filepath),
      path.extname(filepath)
    )
    const content = await fs.readFile(filepath)
    await this.addFileToAws(resourceId, content)
    return resourceId
  }

  async storeMetadata(properties: object): Promise<string> {
    const resourceId = this.generateResourceId(this._metadataFileName, 'json')
    await this.addFileToAws(resourceId, JSON.stringify(properties))
    return resourceId
  }

  /**
   * It takes a resourceId, and returns a ResourceAws object
   * @param {string} resourceId - The name of the file you want to retrieve.
   * @returns A ResourceAws object
   */
  async getData(resourceId: string): Promise<ResourceAws> {
    const bucketParams = { Bucket: this.bucketName, Key: resourceId }
    const data = await this.storage.send(new GetObjectCommand(bucketParams))
    return new ResourceAws(data)
  }

  /**
   * It takes a resourceId and a body, and then uploads the body to the AWS S3 bucket with the
   * resourceId as the key
   * @param {string} resourceId - The name of the file you want to upload.
   * @param {Buffer | string} body - The file to be uploaded.
   * @returns The data that was sent to the AWS S3 bucket.
   */
  protected async addFileToAws(
    resourceId: string,
    body: Buffer | string
  ): Promise<PutObjectCommandOutput> {
    const uploadParams = {
      Bucket: this.bucketName,
      Key: resourceId,
      Body: body
    }
    const data = await this.storage.send(new PutObjectCommand(uploadParams))
    return data
  }

  /**
   * It takes a name and an extension, and returns a string that is either the name and extension, or
   * the name, a timestamp, and the extension
   * @param {string} name - The name of the file.
   * @param {string} extension - The file extension of the file you're uploading.
   * @returns A string that is the name of the file with the extension.
   */
  protected generateResourceId(name: string, extension: string): string {
    return this._overwriteFiles
      ? `${name}.${extension}`
      : `${name}-${Date.now()}.${extension}`
  }
}
