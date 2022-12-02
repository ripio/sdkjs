/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigNumber } from 'ethers'
import { ContractManager } from './ContractManager'
import { isRequired, requireParam, validateAbi } from '../utils/validations'
import { TransactionResponse } from '../types/interfaces'
import erc721 from '../erc_standards/ERC721.json'
import errors from '../types/errors'

export class NFT721Manager extends ContractManager {
  validateStandard(): void {
    requireParam(this._abi, errors.SDK_NOT_INITIALIZED)
    validateAbi(erc721, this._abi!)
  }

  /**
   * Returns the number of tokens in `owner`'s account.
   * @param {string} owner - The address of the account to query the balance of.
   * @returns The balance of the owner.
   */
  async balanceOf(owner: string = isRequired('owner')): Promise<BigNumber> {
    const { value } = await this.execute({
      method: 'balanceOf(address)',
      params: [owner]
    })
    return value
  }

  /**
   * Returns the owner of the `tokenId` token.
   * @param {string} tokenId - The token ID of the token you want to get the owner of.
   * @returns The address of the owner of the token.
   */
  async ownerOf(tokenId: string = isRequired('tokenId')): Promise<string> {
    const { value } = await this.execute({
      method: 'ownerOf(uint256)',
      params: [tokenId]
    })
    return value
  }

  /**
   * Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
   * are aware of the ERC721 protocol to prevent tokens from being forever locked.
   * @param {string} from - The address of the current owner of the token.
   * @param {string} to - The address of the receiver
   * @param {string} tokenId - The token ID of the token you want to transfer.
   * @param {string} [data] - The data parameter is optional. If you want to send some data along with
   * the token transfer, you can pass it in here.
   * @returns A promise that resolves to a TransactionResponse object.
   */
  async safeTransferFrom(
    from: string = isRequired('from'),
    to: string = isRequired('to'),
    tokenId: string = isRequired('tokenId'),
    data?: string
  ): Promise<TransactionResponse> {
    const executeFunctionOptions = data
      ? {
          method: 'safeTransferFrom(address,address,uint256,bytes)',
          params: [from, to, tokenId, data]
        }
      : {
          method: 'safeTransferFrom(address,address,uint256)',
          params: [from, to, tokenId]
        }
    const { transactionResponse } = await this.execute(executeFunctionOptions)
    return transactionResponse!
  }

  /**
   * Transfers `tokenId` token from `from` to `to`.
   * WARNING: Usage of this method is discouraged, use {safeTransferFrom} whenever possible.
   * @param {string} from - The address of the current owner of the token
   * @param {string} to - The address of the recipient of the token.
   * @param {string} tokenId - The token ID of the token you want to transfer.
   * @returns A transaction response object.
   */
  async transferFrom(
    from: string = isRequired('from'),
    to: string = isRequired('to'),
    tokenId: string = isRequired('tokenId')
  ): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'transferFrom',
      params: [from, to, tokenId]
    })
    return transactionResponse!
  }

  /**
   * Gives permission to `to` to transfer `tokenId` token to another account.
   * The approval is cleared when the token is transferred.
   * @param {string} to - The address of the recipient of the token
   * @param {string} tokenId - The token ID of the token you want to approve.
   * @returns A transaction response object.
   */
  async approve(
    to: string = isRequired('to'),
    tokenId: string = isRequired('tokenId')
  ): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'approve(address,uint256)',
      params: [to, tokenId]
    })
    return transactionResponse!
  }

  /**
   * Approve or remove `operator` as an operator for the caller.
   * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
   * @param {string} operator - The address of the operator that is approved or revoked approval for
   * _tokenId.
   * @param {boolean} approved - true if the operator is approved, false to revoke approval
   * @returns A TransactionResponse object.
   */
  async setApprovalForAll(
    operator: string = isRequired('operator'),
    approved: boolean = isRequired('approved')
  ): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'setApprovalForAll(address,bool)',
      params: [operator, approved]
    })
    return transactionResponse!
  }

  /**
   * Returns the account approved for `tokenId` token.
   * @param {string} tokenId - The token ID of the token you want to check the approval of.
   * @returns The address of the approved account.
   */
  async getApproved(tokenId: string = isRequired('tokenId')): Promise<string> {
    const { value } = await this.execute({
      method: 'getApproved(uint256)',
      params: [tokenId]
    })
    return value
  }

  /**
   * Returns if the `operator` is allowed to manage all of the assets of `owner`.
   * @param {string} owner - The address of the owner of the token
   * @param {string} operator - The address of the operator
   * @returns A boolean value.
   */
  async isApprovedForAll(
    owner: string = isRequired('owner'),
    operator: string = isRequired('operator')
  ): Promise<boolean> {
    const { value } = await this.execute({
      method: 'isApprovedForAll(address,address)',
      params: [owner, operator]
    })
    return value
  }
}
