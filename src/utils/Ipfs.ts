import { isRequired } from './validations'
import { create, globSource } from 'ipfs-http-client'
import { ensureIpfsUriPrefix, stripIpfsUriPrefix } from './ipfs-utils'
import { concat } from 'uint8arrays/concat'
import { toString } from 'uint8arrays/to-string'
import all from 'it-all'
import { GenericObject } from '../types/interfaces'
import errors from '../types/errors'

export class Ipfs {
  private ipfs

  /**
   * constructor for Ipfs
   * @param  {string} ipfsUrl ipfs node url
   * @return {Ipfs} returns an instance of Ipfs
   */
  constructor(ipfsUrl: string = isRequired('ipfsUrl')) {
    this.ipfs = create({ url: ipfsUrl })
  }

  /**
   * Upload a directory of files to nft storage
   * @param {string} path to the directory containing the files to upload
   * @return {Promise<string>} returns the cid of the uploaded directory
   */
  async uploadImages(path: string = isRequired('path')): Promise<string> {
    let directoryCid = ''
    for await (const file of this.ipfs.addAll(globSource(path, '**/*'), {
      wrapWithDirectory: true
    })) {
      // the last file is the directory
      directoryCid = file.cid.toString()
    }
    return directoryCid
  }

  /**
   * Get all the files in the given directory
   * @param  {string} ipfsPath cid of the directory to list
   * @return {Promise<Array<object>>} returns an array of files
   */
  async getDirectoryFiles(
    ipfsPath: string = isRequired('ipfsPath')
  ): Promise<Array<object>> {
    const links = []
    for await (const link of this.ipfs.ls(ipfsPath)) {
      links.push({ ...link, cid: link.cid.toString() })
    }
    return links
  }

  /**
   * Stores an image and its metadata in nft storage
   * @param {string} cidOrURI IPFS CID string or `ipfs://<cid>` style URI
   * @param {object} properties metadata to store with the image
   * @return {Promise<string>} returns the uri of the uploaded metadata
   *
   * * @example
   * ```js
   * await instance.storeAsset('aCid', { level: 1 })
   * await instance.storeAsset('ipfs://aCid', { level: 1 })
   * await instance.storeAsset('aDirectoryCid/exampleImage.png', { level: 1 })
   * await instance.storeAsset('ipfs://aDirectoryCid/exampleImage.png', { level: 1 })
   * ```
   */
  async storeAsset(
    cidOrURI: string = isRequired('cidOrURI'),
    properties: object = {}
  ): Promise<string> {
    const assetURI = ensureIpfsUriPrefix(cidOrURI)
    return this.storeMetadata({ image: assetURI, ...properties })
  }

  /**
   * It takes a JSON object and adds it to IPFS, returning the IPFS URI of the file
   * @param {object} properties - object = isRequired('properties')
   * @returns {Promise<string>} returns the uri of the uploaded metadata
   */
  async storeMetadata(
    properties: object = isRequired('properties')
  ): Promise<string> {
    const metadata = JSON.stringify(properties)
    try {
      const { /* The CID of the metadata file. */ cid: metadataCid } =
        await this.ipfs.add({
          path: '/nft/metadata.json',
          content: metadata
        })
      return ensureIpfsUriPrefix(metadataCid.toString()) + '/metadata.json'
    } catch (error) {
      throw errors.IPFS_ADD(<Error>error)
    }
  }

  /**
   * Get the full contents of the IPFS object identified by the given CID or URI.
   *
   * @param {string} cidOrURI - IPFS CID string or `ipfs://<cid>` style URI
   * @returns {Promise<Uint8Array>} - contents of the IPFS object
   */
  async getIPFS(
    cidOrURI: string = isRequired('cidOrURI')
  ): Promise<Uint8Array> {
    const cid = stripIpfsUriPrefix(cidOrURI)
    return concat(await all(this.ipfs.cat(cid)))
  }

  /**
   * Get the contents of the IPFS object identified by the given CID or URI, and return it as a string.
   *
   * @param {string} cidOrURI - IPFS CID string or `ipfs://<cid>` style URI
   * @returns {Promise<string>} - the contents of the IPFS object as a string
   */
  async getIPFSString(
    cidOrURI: string = isRequired('cidOrURI')
  ): Promise<string> {
    const bytes = await this.getIPFS(cidOrURI)
    return toString(bytes)
  }

  /**
   * Get the contents of the IPFS object identified by the given CID or URI, and parse it as JSON, returning the parsed object.
   *
   * @param {string} cidOrURI - IPFS CID string or `ipfs://<cid>` style URI
   * @returns {Promise<GenericObject>} - contents of the IPFS object, as a javascript object (or array, etc depending on what was stored). Fails if the content isn't valid JSON.
   */
  async getIPFSJSON(
    cidOrURI: string = isRequired('cidOrURI')
  ): Promise<GenericObject> {
    const str = await this.getIPFSString(cidOrURI)
    return JSON.parse(str)
  }

  /**
   * Get the full contents of the IPFS object identified by the given CID or URI, and return it as a base64 encoded string.
   *
   * @param {string} cidOrURI - IPFS CID string or `ipfs://<cid>` style URI
   * @returns {Promise<string>} - contents of the IPFS object, encoded to base64
   */
  async getIPFSBase64(
    cidOrURI: string = isRequired('cidOrURI')
  ): Promise<string> {
    const bytes = await this.getIPFS(cidOrURI)
    return toString(bytes, 'base64')
  }
}
