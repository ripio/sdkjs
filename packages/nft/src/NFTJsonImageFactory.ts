import { NFT } from './NFT'
import { NFTFactory } from './NFTFactory'
import { Resource, StorageType } from './storage'
import { NFTMetadata } from './types/interfaces'

export class NFTJsonImageFactory extends NFTFactory {
  static async createNFT(
    resource: Resource,
    tokenId: string,
    storage: StorageType
  ): Promise<NFT> {
    const nftMetadata = (await resource.getJsonData()) as NFTMetadata
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const imageResource = await storage.getData(nftMetadata.image!)
    const image = await imageResource.getBase64Data()
    const nftArgs: {
      tokenId: string
      nftMetadata?: NFTMetadata
      image?: string
    } = {
      tokenId,
      nftMetadata,
      image
    }
    return new NFT(nftArgs)
  }
}
