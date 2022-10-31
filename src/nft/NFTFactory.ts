import { isRequired } from '../utils/validations'
import StorageType from './storage/StorageType'
import { NFT_METADATA_FORMAT } from './types'
import { NFT } from './NFT'
import { NFT721Manager } from '../managers/NFT721Manager'
import errors from '../types/errors'
import { NftMetadata } from '../types/interfaces'

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
    nftManager: NFT721Manager = isRequired('nftManager'),
    storage: StorageType = isRequired('storage'),
    nftFormat: NFT_METADATA_FORMAT = isRequired('nftFormat')
  ) {
    this._manager = nftManager
    this._storage = storage
    this._nftFormat = nftFormat
  }

  // getters
  get manager(): NFT721Manager {
    return this._manager
  }

  get storage(): StorageType {
    return this._storage
  }

  get nftFormat(): NFT_METADATA_FORMAT {
    return this._nftFormat
  }
  // end getters

  /**
   * Create a new NFT instance from a tokenId.
   * @param  {string} tokenId - The token id of the nft.
   * @return {Promise<NFT>} - Returns a new NFT instance.
   */
  async createNFT(tokenId: string = isRequired('tokenId')): Promise<NFT> {
    if (!this._manager.implements('tokenURI', ['uint256'])) {
      throw errors.TOKEN_URI_NOT_IMPLEMENTED(this._manager.contractAddr || '') // Avoid forbidden-non-null-assertion
    }

    let tokenUri = ''
    try {
      const { value } = await this._manager.execute({
        method: 'tokenURI(uint256)',
        params: [tokenId]
      })
      tokenUri = value
    } catch (error) {
      throw errors.GET_TOKEN_URI(tokenId, <Error>error)
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
        const imageResource = await this._storage.getData(metadata.image || '') // Avoid forbidden-non-null-assertion
        const image = await imageResource.getBase64Data()
        nftArgs['nftMetadata'] = metadata
        nftArgs['image'] = image
        break
      }
    }

    return new NFT(nftArgs)
  }
}
