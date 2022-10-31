import { create, IPFSHTTPClient } from 'ipfs-http-client'
import ResourceIpfs from './ResourceIpfs'
import StorageType from './StorageType'
import { stripIpfsUriPrefix } from '../../utils/ipfs-utils'

export default class StorageIpfs implements StorageType {
  readonly storage: IPFSHTTPClient
  /**
   * The constructor function takes an url, creates an instance of IPFSHTTPClient
   * and assigns it to the data property of the class
   * @param {string} url - The URL of the IPFS node you want to connect to.
   */
  constructor(url: string) {
    this.storage = create({ url })
  }
  /**
   * It returns a ResourceIpfs object.
   * @param {string} resourceId - The content identifier of the data you want to retrieve (IPFS CID string or `ipfs://<cid>` style URI).
   * @returns A ResourceIpfs object
   */
  async getData(resourceId: string): Promise<ResourceIpfs> {
    const cid = stripIpfsUriPrefix(resourceId)
    const data = this.storage.cat(cid)
    return new ResourceIpfs(data)
  }
}
