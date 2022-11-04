/* eslint-disable @typescript-eslint/no-explicit-any */
import Resource from './Resource'

export default interface StorageType {
  storage: any

  /**
   * It returns a Resource object.
   * @param {string} resourceId - The resource id of the data you want to retrieve
   * @returns A Resource object
   */
  getData(resourceId: string): Promise<Resource>
  /**
   * It uploads a file
   * @param {string} filename - The name of the file you want to upload.
   * @returns returns the resource id of the uploaded file
   */
  storeFile(filename: string): Promise<string>
  /**
   * It takes an object and stores it as JSON, returning the resource id of the file
   * @param {object} properties - metadata to store
   * @returns {Promise<string>} returns the resource id of the uploaded metadata
   */
  storeMetadata(properties: object): Promise<string>
  /**
   * Upload a directory of files
   * @param {string} path - path to the directory containing the files to upload
   * @return {Promise<string>} returns the resource id of the uploaded directory
   */
  storeFiles(path: string): Promise<string>
  /**
   * Get the resource ids of all the files in the given directory
   * @param  {string} path - resource id of the directory to list
   * @return {Promise<Array<string>>} returns an array of resource ids
   */
  getDirectoryFiles(ipfsPath: string): Promise<Array<string>>
}
