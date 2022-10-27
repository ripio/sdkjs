import { NftMetadata } from '../types/interfaces'
import { Ipfs } from '../utils/Ipfs'
import { isRequired } from '../utils/validations'

export class NFT {
  protected _tokenId: string
  protected _name: string | undefined
  protected _description: string | undefined
  protected _image: string | undefined
  protected _imageUri: string | undefined
  protected _attributes: Array<object> | undefined
  protected _jsonData: NftMetadata

  /**
   * @param {string} tokenId - The token ID of the nft.
   * @param {NftMetadata} nftMetadata - The metadata associated to the token.
   * @returns NFT object.
   */
  constructor(
    tokenId: string = isRequired('tokenId'),
    nftMetadata: NftMetadata = isRequired('nftMetadata')
  ) {
    this._tokenId = tokenId
    this._name = nftMetadata.name
    this._description = nftMetadata.description
    this._imageUri = nftMetadata.image
    this._attributes = nftMetadata.attributes || nftMetadata.traits
    this._jsonData = nftMetadata
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

  get jsonData(): NftMetadata {
    return this._jsonData
  }
  // end getters

  /**
   * saves image base64 on image attribute
   * @param  {Ipfs} ipfs ipfs instance.
   * @return {Promise<void>}
   */
  async saveImageBase64(ipfs: Ipfs = isRequired('ipfs')) {
    if (this._imageUri) {
      this._image = await ipfs.getIPFSBase64(this._imageUri)
    }
  }
}
