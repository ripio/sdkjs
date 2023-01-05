import { NFT_METADATA_FORMAT } from './types'
import { NFT721Manager, errors } from '@ripio/sdk'
import { StorageType } from './storage'
import { NFT } from './NFT'
import { NFTJsonFactory } from './NFTJsonFactory'
import { NFTImageFactory } from './NFTImageFactory'
import { NFTJsonImageFactory } from './NFTJsonImageFactory'

const { MUST_ACTIVATE, TOKEN_URI_NOT_IMPLEMENTED, GET_TOKEN_URI } = errors

export class NFTHandler {
  /**
   * It takes a tokenId, and returns an NFT object
   * @param {NFT721Manager} nftManager - NFT721Manager - The NFT721Manager instance that will be used
   * to fetch the NFT tokenURI.
   * @param {StorageType} storage - StorageType - The storage to fetch the NFT metadata.
   * @param {string} tokenId - The tokenId of the NFT you want to get.
   * @param {NFT_METADATA_FORMAT} nftFormat - The format of the NFT metadata.
   * @returns The NFT object
   */
  static async get(
    nftManager: NFT721Manager,
    storage: StorageType,
    tokenId: string,
    nftFormat: NFT_METADATA_FORMAT
  ): Promise<NFT> {
    if (!nftManager.isActive) {
      throw MUST_ACTIVATE
    }
    if (!nftManager.implements('tokenURI', ['uint256'])) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      throw TOKEN_URI_NOT_IMPLEMENTED(nftManager.contractAddr!)
    }
    let tokenUri = ''
    try {
      const { value } = await nftManager.execute({
        method: 'tokenURI(uint256)',
        params: [tokenId]
      })
      tokenUri = value
    } catch (error) {
      throw GET_TOKEN_URI(tokenId, <Error>error)
    }
    const resource = await storage.getData(tokenUri)
    switch (nftFormat) {
      case NFT_METADATA_FORMAT.IMAGE:
        return await NFTImageFactory.createNFT(resource, tokenId)
      case NFT_METADATA_FORMAT.JSON:
        return await NFTJsonFactory.createNFT(resource, tokenId)
      case NFT_METADATA_FORMAT.JSON_WITH_IMAGE: {
        return await NFTJsonImageFactory.createNFT(resource, tokenId, storage)
      }
    }
  }
}
