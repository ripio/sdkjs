/* eslint-disable @typescript-eslint/no-non-null-assertion */
import StorageType from './storage/StorageType'
import { NFT_METADATA_FORMAT } from './types'
import { NFT } from './NFT'
import { NFT721Manager } from '@ripio/sdk'
import { errors } from '@ripio/sdk'
import { NftMetadata } from './types/interfaces'

const { MUST_ACTIVATE, TOKEN_URI_NOT_IMPLEMENTED, GET_TOKEN_URI } =
  errors.default

export class NFTFactory {
  protected _manager: NFT721Manager
  protected _storage: StorageType
  protected _nftFormat: NFT_METADATA_FORMAT

  /**
   * @param {NFT721Manager} nftManager - The manager of the contract.
   * @param {StorageType} storage - A storage to bring the necessary data.
   * @param {NFT_METADATA_FORMAT} nftFormat - The format of the nft metadata.
   * @returns NFTFactory object.
   */
  constructor(
    nftManager: NFT721Manager,
    storage: StorageType,
    nftFormat: NFT_METADATA_FORMAT
  ) {
    if (!nftManager.isActive) {
      throw MUST_ACTIVATE
    }
    this._manager = nftManager
    this._storage = storage
    this._nftFormat = nftFormat
  }

  /**
   * Create a new NFT instance from a tokenId.
   * @param  {string} tokenId - The token id of the nft.
   * @return {Promise<NFT>} - Returns a new NFT instance.
   */
  async createNFT(tokenId: string): Promise<NFT> {
    if (!this._manager.implements('tokenURI', ['uint256'])) {
      throw TOKEN_URI_NOT_IMPLEMENTED(this._manager.contractAddr!)
    }

    let tokenUri = ''
    try {
      const { value } = await this._manager.execute({
        method: 'tokenURI(uint256)',
        params: [tokenId]
      })
      tokenUri = value
    } catch (error) {
      throw GET_TOKEN_URI(tokenId, <Error>error)
    }
    const resource = await this._storage.getData(tokenUri)
    const nftArgs: {
      tokenId: string
      nftMetadata?: NftMetadata
      image?: string
    } = { tokenId }

    switch (this._nftFormat) {
      case NFT_METADATA_FORMAT.IMAGE:
        nftArgs['image'] = await resource.getBase64Data()
        break
      case NFT_METADATA_FORMAT.JSON:
        nftArgs['nftMetadata'] = (await resource.getJsonData()) as NftMetadata
        break
      case NFT_METADATA_FORMAT.JSON_WITH_IMAGE: {
        const metadata = (await resource.getJsonData()) as NftMetadata
        const imageResource = await this._storage.getData(metadata.image!)
        const image = await imageResource.getBase64Data()
        nftArgs['nftMetadata'] = metadata
        nftArgs['image'] = image
        break
      }
    }

    return new NFT(nftArgs)
  }
}
