import { NFT } from './NFT'
import { NFTFactory } from './NFTFactory'
import { Resource } from './storage'
import { NFTMetadata } from './types/interfaces'

export class NFTImageFactory extends NFTFactory {
  /**
   * Create a new NFT instance from a tokenId.
   * @param {Resource} resource - Resource - The resource object with the NFT metadata.
   * @param {string} tokenId - The token id of the NFT.
   * @returns A new NFT object
   */
  static async createNFT(resource: Resource, tokenId: string): Promise<NFT> {
    const nftArgs: {
      tokenId: string
      nftMetadata?: NFTMetadata
      image?: string
    } = { tokenId, image: await resource.getBase64Data() }
    return new NFT(nftArgs)
  }
}
