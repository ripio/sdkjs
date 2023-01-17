import {
  NFT_METADATA_FORMAT,
  NFTHandlerChangeParams,
  NFTHandlerCreateParams,
  NFTMetadata
} from './types'
import { NFT721Manager, errors, interfaces } from '@ripio/sdk'
import { StorageType } from './storage'
import { NFT } from './NFT'
import { NFTJsonFactory } from './NFTJsonFactory'
import { NFTImageFactory } from './NFTImageFactory'
import { NFTJsonImageFactory } from './NFTJsonImageFactory'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ManagerMustBeActive } from './utils'

const { GET_TOKEN_URI, FUNCTION_NOT_IMPLEMENTED, MISSING_PARAM } = errors

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
  @ManagerMustBeActive()
  static async get(
    nftManager: NFT721Manager,
    storage: StorageType,
    tokenId: string,
    nftFormat: NFT_METADATA_FORMAT
  ): Promise<NFT> {
    if (!nftManager.implements('tokenURI', ['uint256'])) {
      throw FUNCTION_NOT_IMPLEMENTED(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nftManager.contractAddr!,
        'tokenURI(uint256)'
      )
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
   * It takes an owner, and returns a list of NFT objects
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
    const ownerBalance = await NFTHandler.getAddressBalance(nftManager, owner)
    const tokenIndexes = [...Array(ownerBalance).keys()]
    const tokenIds = await Promise.all(
      tokenIndexes.map(index =>
        NFTHandler.tokenOfOwnerByIndex(nftManager, owner, index)
      )
    )

    return await Promise.all(
      tokenIds.map(tokenId => this.get(nftManager, storage, tokenId, nftFormat))
    )
  }

  /**
   * It takes an owner, and returns the last tokenId.
   * @param {NFT721Manager} nftManager - NFT721Manager - The NFT721Manager instance that will be used
   * to fetch the NFT tokenId.
   * @param {string} owner - The owner of the NFTs.
   * @returns The last tokenId
   */
  static async getLastNFTId(
    nftManager: NFT721Manager,
    owner: string
  ): Promise<string | null> {
    const ownerBalance = await NFTHandler.getAddressBalance(nftManager, owner)
    const lastTokenIndex = ownerBalance - 1

    return lastTokenIndex < 0
      ? null
      : await NFTHandler.tokenOfOwnerByIndex(nftManager, owner, lastTokenIndex)
  }

  /**
   * It uploads the image and/or metadata to the storage, and then calls the `setTokenURI` function on the
   * NFT manager
   * @param {NFTHandlerChangeParams}  - NFTHandlerChangeParams dict
   * @return {Promise<interfaces.ExecuteResponse>} returns a promise with an ExecuteResponse.
   */
  @ManagerMustBeActive('nftManager')
  static async change({
    nftManager,
    storage,
    nftFormat,
    tokenId,
    nftMetadata,
    image,
    value
  }: NFTHandlerChangeParams): Promise<interfaces.ExecuteResponse> {
    if (!nftManager.implements('setTokenURI', ['uint256', 'string'])) {
      throw FUNCTION_NOT_IMPLEMENTED(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nftManager.contractAddr!,
        'setTokenURI(uint256,string)'
      )
    }

    const tokenUri = await NFTHandler.uploadData(
      nftFormat,
      storage,
      image,
      nftMetadata
    )

    return await nftManager.execute({
      method: 'setTokenURI(uint256,string)',
      value,
      params: [tokenId, tokenUri]
    })
  }

  /**
   * It uploads the image and/or metadata to the storage, and then calls the `safeMint`
   * function on the NFT manager
   * @param {NFTHandlerCreateParams}  - NFTHandlerCreateParams dict
   * @return {Promise<interfaces.ExecuteResponse>} returns a promise with an ExecuteResponse.
   */
  @ManagerMustBeActive('nftManager')
  static async create({
    nftManager,
    storage,
    nftFormat,
    address,
    tokenId,
    nftMetadata,
    image,
    value
  }: NFTHandlerCreateParams): Promise<interfaces.ExecuteResponse> {
    const typeParams = tokenId
      ? ['address', 'uint256', 'string']
      : ['address', 'string']
    if (!nftManager.implements('safeMint', typeParams)) {
      throw FUNCTION_NOT_IMPLEMENTED(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nftManager.contractAddr!,
        `safeMint(${typeParams.join(',')})`
      )
    }
    const uri = await NFTHandler.uploadData(
      nftFormat,
      storage,
      image,
      nftMetadata
    )
    const params = tokenId ? [address, tokenId, uri] : [address, uri]
    return await nftManager.execute({
      method: 'safeMint',
      value,
      params
    })
  }

  /**
   * It uploads the image and/or metadata to the storage provider and returns the URI of the uploaded
   * data
   * @param {NFT_METADATA_FORMAT} nftFormat - The format of the NFT metadata.
   * @param {StorageType} storage - StorageType - This is the storage type that you want to use.
   * @param {string | undefined} image - The image to be uploaded. This is a base64 encoded string.
   * @param {NFTMetadata | undefined} nftMetadata - The metadata associated to the token.
   * @returns The tokenUri is being returned.
   */
  private static async uploadData(
    nftFormat: NFT_METADATA_FORMAT,
    storage: StorageType,
    image?: string,
    nftMetadata?: NFTMetadata
  ): Promise<string> {
    let tokenUri = ''
    switch (nftFormat) {
      case NFT_METADATA_FORMAT.IMAGE:
        if (!image) throw MISSING_PARAM('image (encoded as base64)')

        tokenUri = await storage.storeBase64Image(image)
        break

      case NFT_METADATA_FORMAT.JSON:
        if (!nftMetadata) throw MISSING_PARAM('nftMetadata')

        tokenUri = await storage.storeMetadata(nftMetadata)
        break

      case NFT_METADATA_FORMAT.JSON_WITH_IMAGE: {
        if (!image || !nftMetadata)
          throw MISSING_PARAM('image (encoded as base64) or nftMetadata')

        const imageUri = await storage.storeBase64Image(image)
        nftMetadata['image'] = imageUri
        tokenUri = await storage.storeMetadata(nftMetadata)
        break
      }
    }
    return tokenUri
  }

  /**
   * It takes an address and returns its balance
   * @param {NFT721Manager} nftManager - NFT721Manager - The NFT721Manager instance that will be used
   * to fetch the balance.
   * @param {string} address - The address of which we want the balance.
   * @returns The balance
   */
  @ManagerMustBeActive()
  private static async getAddressBalance(
    nftManager: NFT721Manager,
    address: string
  ): Promise<number> {
    if (!nftManager.implements('balanceOf', ['address'])) {
      throw FUNCTION_NOT_IMPLEMENTED(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nftManager.contractAddr!,
        'balanceOf(address)'
      )
    }

    const { value } = await nftManager.execute({
      method: 'balanceOf(address)',
      params: [address]
    })
    return value
  }

  /**
   * Takes an address and an index and returns the corresponding tokenId.
   * @param {NFT721Manager} nftManager - NFT721Manager - The NFT721Manager instance that will be used
   * to fetch the tokenId.
   * @param {string} owner - The owner of the nft.
   * @param {number} index - The index of the tokenUri.
   * @returns The token ID for the provided index and owner
   */
  @ManagerMustBeActive()
  private static async tokenOfOwnerByIndex(
    nftManager: NFT721Manager,
    owner: string,
    index: number
  ): Promise<string> {
    if (!nftManager.implements('tokenOfOwnerByIndex', ['address', 'uint256'])) {
      throw FUNCTION_NOT_IMPLEMENTED(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nftManager.contractAddr!,
        'tokenOfOwnerByIndex(address,uint256)'
      )
    }

    const { value } = await nftManager.execute({
      method: 'tokenOfOwnerByIndex(address,uint256)',
      params: [owner, index]
    })
    return value
  }
}
