import { NFT_METADATA_FORMAT } from './types'
import { NFT721Manager, errors } from '@ripio/sdk'
import { StorageType } from './storage'
import { NFT } from './NFT'
import { NFTJsonFactory } from './NFTJsonFactory'
import { NFTImageFactory } from './NFTImageFactory'
import { NFTJsonImageFactory } from './NFTJsonImageFactory'

const {
  MUST_ACTIVATE,
  TOKEN_URI_NOT_IMPLEMENTED,
  GET_TOKEN_URI,
  TOKEN_OF_OWNER_BY_INDEX_NOT_IMPLEMENTED,
  TRANSACTION_FAILED,
  BALANCE_OF_FAILED
} = errors

export class NFTHandler {
  /**
   * It takes a tokenId, and returns a NFT object
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

  /**
   * It takes a owner, and returns a list of NFT objects
   * @param {NFT721Manager} nftManager - NFT721Manager - The NFT721Manager instance that will be used
   * to fetch the NFTs tokenURIs.
   * @param {StorageType} storage - StorageType - The storage to fetch the NFTs metadata.
   * @param {string} owner - The owner of the NFTs.
   * @param {NFT_METADATA_FORMAT} nftFormat - The format of the NFTs metadata.
   * @returns The NFT object
   */

  static async getNFTListByOwner(
    nftManager: NFT721Manager,
    storage: StorageType,
    owner: string,
    nftFormat: NFT_METADATA_FORMAT
  ): Promise<NFT[]> {
    if (!nftManager.isActive) {
      throw MUST_ACTIVATE
    }
    if (!nftManager.implements('tokenOfOwnerByIndex', ['address', 'uint256'])) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      throw TOKEN_OF_OWNER_BY_INDEX_NOT_IMPLEMENTED(nftManager.contractAddr!)
    }

    let ownerBalance
    try {
      const { value } = await nftManager.execute({
        method: 'balanceOf(address)',
        params: [owner]
      })
      ownerBalance = value
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw BALANCE_OF_FAILED(owner, error)
    }

    const tokenIds: string[] = []

    for (let i = 0; i < ownerBalance; i++) {
      let tokenId
      try {
        const { value } = await nftManager.execute({
          method: 'tokenOfOwnerByIndex(address,uint256)',
          params: [owner, i]
        })
        tokenId = value
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        throw TRANSACTION_FAILED(error)
      }
      tokenIds.push(tokenId)
    }

    return await Promise.all(
      tokenIds.map(tokenId => this.get(nftManager, storage, tokenId, nftFormat))
    )
  }
}
