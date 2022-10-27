import all from 'it-all'
import { create, IPFSHTTPClient } from 'ipfs-http-client'
import ResourceIpfs from './ResourseIpfs'
import StorageType from './StorageType'
import { isRequired } from '../../utils/validations'

export default class StorageIpfs implements StorageType {
  readonly storage: IPFSHTTPClient
  /**
   * The constructor function takes an url, creates an instance of IPFSHTTPClient
   * and assigns it to the data property of the class
   * @param {string} url - The URL of the IPFS node you want to connect to.
   */
  constructor(url: string = isRequired('url')) {
    this.storage = create({ url })
  }
  /**
   * It returns a ResourceIpfs object.
   * @param {string} cid - The content identifier of the data you want to retrieve.
   * @returns A ResourceIpfs object
   */
  async getData(cid: string = isRequired('cid')): Promise<ResourceIpfs> {
    const data = await all(this.storage.cat(cid))
    return new ResourceIpfs(data)
  }
}
