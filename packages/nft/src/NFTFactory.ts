/* eslint-disable @typescript-eslint/no-unused-vars */
import StorageType from './storage/StorageType'
import Resource from './storage/Resource'
import { NFT } from './NFT'

export abstract class NFTFactory {
  /**
   * Create a new NFT instance from a tokenId.
   * @param  {Resource} resource - The resource with the nft data.
   * @param  {string} tokenId - The token id of the nft.
   * @param  {StorageType} storage - A storage to get extra resources.
   * @return {Promise<NFT>} - Returns a new NFT instance.
   */
  static async createNFT(
    resource: Resource,
    tokenId: string,
    storage?: StorageType
  ): Promise<NFT> {
    throw new Error('Method not implemented.')
  }
}
