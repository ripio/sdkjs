import axios, { AxiosInstance } from 'axios'
import ResourceHttp from './ResourceHttp'
import StorageType from './StorageType'

export default class StorageHttp implements StorageType {
  readonly storage: AxiosInstance

  /**
   * The constructor function creates an instance of AxiosInstance
   * and assigns it to the storage property of the class
   */
  constructor() {
    this.storage = axios.create({ responseType: 'arraybuffer' })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  storeFile(filepath: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  storeMetadata(properties: object): Promise<string> {
    throw new Error('Method not implemented.')
  }
  /**
   * It returns a promise that resolves to a ResourceHttp object.
   * @param {string} resourceId - The url of the resource you want to retrieve.
   * @returns A promise that resolves to a ResourceHttp object.
   */
  async getData(resourceId: string): Promise<ResourceHttp> {
    const response = await this.storage(resourceId)
    return new ResourceHttp(response.data)
  }
}
