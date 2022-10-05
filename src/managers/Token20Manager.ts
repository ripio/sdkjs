/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigNumber } from 'ethers'
import { ContractManager } from './ContractManager'
import { isRequired, requireParam } from '../utils/validations'
import { UnitTypes } from '../types/enums'
import { toWei } from '../utils/conversions'
import { validateAbi } from '../utils/validations'
import { TransactionResponse } from '../types/interfaces'
import erc20 from '../erc_standards/ERC20.json'
import errors from '../types/errors'
export class Token20Manager extends ContractManager {
  /**
   * It validates the functions and events of the ERC20 contract.
   */
  validateStandard(): void {
    requireParam(this._abi, errors.SDK_NOT_INITIALIZED)
    validateAbi(erc20, this._abi!)
  }

  /**
   * `totalSupply()` returns a promise that resolves to a BigNumber
   * @returns The total supply of the token.
   */
  async totalSupply(): Promise<BigNumber> {
    const { value } = await this.execute({
      method: 'totalSupply'
    })
    return value
  }

  /**
   * `balanceOf` returns the balance of the account passed in as a parameter
   * @param {string} account - The account address to check the balance of.
   * @returns The balance of the account.
   */
  async balanceOf(account: string = isRequired('account')): Promise<BigNumber> {
    const { value } = await this.execute({
      method: 'balanceOf',
      params: [account]
    })
    return value
  }

  /**
   * It returns the amount of tokens that spender is allowed to withdraw from owner.
   * @param {string} owner - The address of the owner of the token.
   * @param {string} spender - The address of the spender
   * @returns The amount of tokens the spender is allowed to spend on behalf of the owner.
   */
  async allowance(
    owner: string = isRequired('owner'),
    spender: string = isRequired('spender')
  ): Promise<BigNumber> {
    const { value } = await this.execute({
      method: 'allowance',
      params: [owner, spender]
    })
    return value
  }

  /**
   * It approves the spender to spend the amount of tokens.
   * @param {string} spender - The address of the account that will be able to spend the tokens.
   * @param {string} amount - The amount of tokens to approve.
   * @param {UnitTypes} unit - UnitTypes = UnitTypes.ETHER
   * @returns A promise that resolves to a transaction response.
   */
  async approve(
    spender: string = isRequired('spender'),
    amount: string = isRequired('amount'),
    unit: UnitTypes = UnitTypes.ETHER
  ): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'approve',
      params: [spender, toWei(amount, unit)]
    })
    return transactionResponse!
  }

  /**
   * It transfers the amount of tokens from the sender to another address.
   * @param {string} to - The address of the recipient of the transfer.
   * @param {string} amount - The amount of tokens to transfer.
   * @param {UnitTypes} unit - UnitTypes = UnitTypes.ETHER
   * @returns A promise that resolves to a transaction response.
   */
  async transfer(
    to: string = isRequired('to'),
    amount: string = isRequired('amount'),
    unit: UnitTypes = UnitTypes.ETHER
  ): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'transfer',
      params: [to, toWei(amount, unit)]
    })
    return transactionResponse!
  }

  /**
   * `transferFrom` is a function that transfers from an address to another address,
   * it also requires the owner of the from address to previously approve the sender to spend the tokens.
   * @param {string} from - The address of the account that is sending the tokens.
   * @param {string} to - The address of the recipient of the transfer.
   * @param {string} amount - The amount of tokens to transfer.
   * @param {UnitTypes} unit - UnitTypes = UnitTypes.ETHER
   * @returns A promise that resolves to a transaction response.
   */
  async transferFrom(
    from: string = isRequired('from'),
    to: string = isRequired('to'),
    amount: string = isRequired('amount'),
    unit: UnitTypes = UnitTypes.ETHER
  ): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'transferFrom',
      params: [from, to, toWei(amount, unit)]
    })
    return transactionResponse!
  }
}
