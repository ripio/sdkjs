import { create, IPFSHTTPClient } from 'ipfs-http-client'
import ResourceIpfs from './ResourceIpfs'
import StorageType from './StorageType'
import { isRequired } from '../../utils/validations'
import { stripIpfsUriPrefix } from '../../utils/ipfs-utils'

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
   * @param {string} cidOrURI - The content identifier of the data you want to retrieve (IPFS CID string or `ipfs://<cid>` style URI).
   * @returns A ResourceIpfs object
   */
  async getData(
    cidOrURI: string = isRequired('cidOrURI')
  ): Promise<ResourceIpfs> {
    const cid = stripIpfsUriPrefix(cidOrURI)
    const data = this.storage.cat(cid)
    return new ResourceIpfs(data)
  }
}
