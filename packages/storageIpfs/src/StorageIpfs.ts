import fs from 'fs/promises'
import { create, IPFSHTTPClient } from 'ipfs-http-client'
import ResourceIpfs from './ResourceIpfs'
import { StorageType } from '@ripio/nft'
import { ensureIpfsUriPrefix, stripIpfsUriPrefix } from './utils'
import errors from './types/errors'

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

  async getData(resourceId: string): Promise<ResourceIpfs> {
    const cid = stripIpfsUriPrefix(resourceId)
    const data = this.storage.cat(cid)
    return new ResourceIpfs(data)
  }

  async storeFile(filepath: string): Promise<string> {
    const content = await fs.readFile(filepath)
    return this.addFileToIpfs(content)
  }

  async storeMetadata(properties: object): Promise<string> {
    const metadata = JSON.stringify(properties)
    return this.addFileToIpfs(metadata)
  }

  /**
   * It takes a Buffer or string, adds it to IPFS, and returns the resource id
   * @param {Buffer | string} content - File content
   * @returns The content resource id of the content added to IPFS.
   */
  protected async addFileToIpfs(content: Buffer | string): Promise<string> {
    try {
      const { cid } = await this.storage.add(content)
      return ensureIpfsUriPrefix(cid.toString())
    } catch (error) {
      throw errors.IPFS_ADD(<Error>error)
    }
  }
}
