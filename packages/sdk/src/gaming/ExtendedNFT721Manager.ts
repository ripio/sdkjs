/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Ipfs } from '../utils/Ipfs'
import { isRequired, requireParam } from '../utils/validations'
import errors from '../types/errors'
import { TokenDataTypes } from '../types/enums'
import { GenericObject, TransactionResponse } from '../types/interfaces'
import { BrowserWeb3Connector, JsonRPCWeb3Connector } from '../connectors'
import { NFT721Manager } from '../managers'

/**
 * @deprecated Use `NFT721Manager` instead
 */
export class ExtendedNFT721Manager extends NFT721Manager {
  protected _ipfs: Ipfs | undefined

  constructor() {
    super()
    console.warn(
      'Deprecation notice: the ExtendedNFT721Manager class is being deprecated. Use NFT721Manager instead.'
    )
  }

  // getters
  get ipfs(): Ipfs | undefined {
    return this._ipfs
  }
  // end getters

  /**
   * async activator for ExtendedNFT721Manager
   * @param  {string} contractAddress contract address
   * @param  {Array<any>} contractAbi parsed json object of contract's abi
   * @param  {string} providerUrl websocket provider url to connect to the provider
   * @param  {string} privateKey contract owner private key to sign transactions
   * @param  {string | Ipfs} ipfs url to get/upload data/images to ipfs or ipfs instance.
   * @param  {AbstractWeb3Connector} connector provider to use in the contract. Must be subclass of AbstractWeb3Connector.
   * @return {Promise<void>} returns an activation promise ExtendedNFT721Manager
   */
  async activate({
    contractAddress,
    contractAbi,
    providerUrl,
    privateKey,
    ipfs,
    connector
  }: {
    contractAddress: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contractAbi: Array<any>
    providerUrl?: string
    privateKey?: string
    ipfs?: string | Ipfs
    connector?: BrowserWeb3Connector | JsonRPCWeb3Connector
  }): Promise<void> {
    await super.activate({
      contractAddress,
      contractAbi,
      providerUrl,
      privateKey,
      connector
    })
    if (ipfs && ipfs instanceof Ipfs) {
      this._ipfs = ipfs
    } else if (ipfs) {
      this._ipfs = new Ipfs(ipfs)
    }
  }

  /**
   * Check if the given address is a the owner of the given id
   * @param  {string} address address to check
   * @param  {string} id id of the token
   * @return {Promise<boolean>} returns true if the address is the owner of the token, false otherwise
   */
  async isOwnerOf(
    address: string = isRequired('address'),
    id: string = isRequired('id')
  ): Promise<boolean> {
    try {
      const { value: owner } = await this.execute({
        method: 'ownerOf',
        params: [id]
      })
      return owner.toLowerCase() === address.toLowerCase()
    } catch (error) {
      throw errors.ADDRESS_OWNERSHIP_ERROR(<Error>error)
    }
  }

  /**
   * Retrieves a token json data or base64 image from ipfs
   * @param {string} tokenId id of the token to retrieve its data from storage (ipfs)
   * @param {TokenDataTypes} type type of the data to retrieve ('json' or 'base64')
   * @return {Promise<GenericObject | string>} returns the json data or the base64 of the token
   */
  async getIPFSTokenData(
    tokenId: string = isRequired('tokenId'),
    type: TokenDataTypes = TokenDataTypes.JSON
  ): Promise<GenericObject | string> {
    requireParam(this._ipfs, errors.IPFS_NOT_INITIALIZED)
    let tokenUri = ''
    try {
      const { value } = await this.execute({
        method: 'tokenURI(uint256)',
        params: [tokenId]
      })
      tokenUri = value
    } catch (error) {
      throw errors.GET_TOKEN_URI(tokenId, <Error>error)
    }
    return type === TokenDataTypes.JSON
      ? this._ipfs!.getIPFSJSON(tokenUri)
      : this._ipfs!.getIPFSBase64(tokenUri)
  }

  // <BURNABLE methods>

  async burn(
    tokenId: string = isRequired('tokenId')
  ): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'burn(uint256)',
      params: [tokenId]
    })
    return transactionResponse!
  }

  // </BURNABLE methods>
  // <MINTABLE methods>

  async mint(
    to: string = isRequired('to'),
    uri: string = isRequired('uri')
  ): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'safeMint',
      params: [to, uri]
    })
    return transactionResponse!
  }

  // </MINTABLE methods>
  // <PAUSABLE methods>

  /**
   * It pauses the contract.
   * @returns The transaction response.
   */
  async pause(): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'pause'
    })
    return transactionResponse!
  }

  /**
   * It unpause the contract
   * @returns TransactionResponse
   */
  async unpause(): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'unpause'
    })
    return transactionResponse!
  }

  // </PAUSABLE methods>
  // <IERC721Metadata methods>

  /**
   * It returns the name of the token.
   * @returns The name of the token.
   */
  async name(): Promise<string> {
    const { value } = await this.execute({
      method: 'name'
    })
    return value
  }

  /**
   * It returns the symbol of the token.
   * @returns The symbol of the token.
   */
  async symbol(): Promise<string> {
    const { value } = await this.execute({
      method: 'symbol'
    })
    return value
  }

  /**
   * `tokenURI` returns the URI of a token
   * @param {string} tokenId - The token ID of the token you want to get the URI for.
   * @returns The tokenURI function returns a string.
   */
  async tokenURI(tokenId: string = isRequired('tokenId')): Promise<string> {
    const { value } = await this.execute({
      method: 'tokenURI(uint256)',
      params: [tokenId]
    })
    return value
  }

  // </IERC721Metadata methods>
}
