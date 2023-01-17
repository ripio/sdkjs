import { NFT } from './NFT'
import { NFTFactory } from './NFTFactory'
import { Resource } from './storage'
import { NFTMetadata } from './types/interfaces'

export class NFTJsonFactory extends NFTFactory {
  static async createNFT(resource: Resource, tokenId: string): Promise<NFT> {
    const nftArgs: {
      tokenId: string
      nftMetadata?: NFTMetadata
      image?: string
    } = { tokenId, nftMetadata: (await resource.getJsonData()) as NFTMetadata }
    return new NFT(nftArgs)
  }
}
