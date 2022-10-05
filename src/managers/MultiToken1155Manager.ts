/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigNumber, BigNumberish } from 'ethers'
import { Bytes, TransactionResponse } from '../types/interfaces'
import { isRequired, requireParam, validateAbi } from '../utils/validations'
import { ContractManager } from './ContractManager'
import erc1155 from '../erc_standards/ERC1155.json'
import errors from '../types/errors'

export class MultiToken1155Manager extends ContractManager {
  validateStandard(): void {
    requireParam(this._abi, errors.SDK_NOT_INITIALIZED)
    validateAbi(erc1155, this._abi!)
  }

  /**
   * `balanceOf` returns the balance of a given account for a given token
   * @param {string} account - The address of the account to query
   * @param {BigNumberish} id - The id of the token you want to check the balance of.
   * @returns The balance of the account for the given id.
   */
  async balanceOf(
    account: string = isRequired('account'),
    id: BigNumberish = isRequired('id')
  ): Promise<BigNumber> {
    const { value } = await this.execute({
      method: 'balanceOf(address,uint256)',
      params: [account, id]
    })
    return value
  }

  /**
   * `balanceOfBatch` returns an array of BigNumbers representing the balance of each account for each
   * token ID
   * @param {string[]} accounts - An array of addresses to check the balance of
   * @param {BigNumberish[]} ids - The ids of the NFTs you want to get the balance of.
   * @returns An array of BigNumbers
   */
  async balanceOfBatch(
    accounts: string[] = isRequired('accounts'),
    ids: BigNumberish[] = isRequired('ids')
  ): Promise<BigNumber[]> {
    const { value } = await this.execute({
      method: 'balanceOfBatch(address[],uint256[])',
      params: [accounts, ids]
    })
    return value
  }

  /**
   * `safeTransferFrom` is a function that allows you to transfer tokens
   * @param {string} from - The address of the current owner of the NFT
   * @param {string} to - The address of the receiver
   * @param {BigNumberish} id - The id of the token you want to transfer
   * @param {BigNumberish} amount - The amount of tokens to transfer.
   * @param {Bytes} data - Bytes = data to be passed along with the transaction.
   * @returns A transaction response object.
   */
  async safeTransferFrom(
    from: string = isRequired('from'),
    to: string = isRequired('to'),
    id: BigNumberish = isRequired('id'),
    amount: BigNumberish = isRequired('amount'),
    data: Bytes = isRequired('data')
  ): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'safeTransferFrom(address,address,uint256,uint256,bytes)',
      params: [from, to, id, amount, data]
    })
    return transactionResponse!
  }

  /**
   * `safeBatchTransferFrom` is a function that allows you to transfer multiple tokens at once
   * @param {string} from - The address of the account that is sending the tokens.
   * @param {string} to - The address of the recipient of the tokens.
   * @param {BigNumberish[]} ids - The ids of the tokens you want to transfer.
   * @param {BigNumberish[]} amounts - An array of amounts to transfer.
   * @param {Bytes[]} data - Bytes[] = data to be passed along with the transaction.
   * @returns A transaction response
   */
  async safeBatchTransferFrom(
    from: string = isRequired('from'),
    to: string = isRequired('to'),
    ids: BigNumberish[] = isRequired('ids'),
    amounts: BigNumberish[] = isRequired('amounts'),
    data: Bytes = isRequired('data')
  ): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method:
        'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)',
      params: [from, to, ids, amounts, data]
    })
    return transactionResponse!
  }

  /**
   * It sets the approval for all the tokens.
   * @param {string} operator - The address of the operator to set approval for.
   * @param {boolean} approved - boolean - true if the operator is approved, false to revoke approval
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
   * It checks if the operator is approved for all the assets of the account.
   * @param {string} account - The address of the account to check for approval.
   * @param {string} operator - The address of the operator
   * @returns A boolean value.
   */
  async isApprovedForAll(
    account: string = isRequired('account'),
    operator: string = isRequired('operator')
  ): Promise<boolean> {
    const { value } = await this.execute({
      method: 'isApprovedForAll(address,address)',
      params: [account, operator]
    })
    return value
  }
}
