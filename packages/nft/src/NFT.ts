import { NFTData, NFTMetadata } from './types/interfaces'

export class NFT {
  protected _tokenId: string
  protected _name: string | undefined
  protected _description: string | undefined
  protected _image: string | undefined
  protected _imageUri: string | undefined
  protected _attributes: Array<object> | undefined
  protected _jsonData: NFTMetadata | undefined

  /**
   * @param {string} tokenId - The token ID of the nft.
   * @param {NFTMetadata} nftMetadata - The metadata associated to the token.
   * @param {string} image - Base64 of the image associated to the token.
   * @returns NFT object.
   */
  constructor({ tokenId, nftMetadata, image }: NFTData) {
    this._tokenId = tokenId
    this._name = nftMetadata?.name
    this._description = nftMetadata?.description
    this._imageUri = nftMetadata?.image
    this._attributes =
      nftMetadata?.attributes || nftMetadata?.traits || nftMetadata?.properties
    this._jsonData = nftMetadata
    this._image = image
  }

  // getters
  get tokenId(): string {
    return this._tokenId
  }

  get name(): string | undefined {
    return this._name
  }

  get description(): string | undefined {
    return this._description
  }

  get image(): string | undefined {
    return this._image
  }

  get imageUri(): string | undefined {
    return this._imageUri
  }

  get attributes(): Array<object> | undefined {
    return this._attributes
  }

  get jsonData(): NFTMetadata | undefined {
    return this._jsonData
  }
  // end getters
}
