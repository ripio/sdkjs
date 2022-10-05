/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigNumber, BigNumberish } from 'ethers'
import { Token20Manager } from '../managers'
import { UnitTypes } from '../types/enums'
import {
  TransactionResponse,
  TransactionResponseExtended
} from '../types/interfaces'
import { toWei } from '../utils/conversions'
import { isRequired } from '../utils/validations'

export class ExtendedToken20Manager extends Token20Manager {
  // <IERC20Metadata methods>

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
   * It returns the decimals places of the token.
   * @returns The decimals places of the token.
   */
  async decimals(): Promise<BigNumber> {
    const { value } = await this.execute({
      method: 'decimals'
    })
    return value
  }
  // </IERC20Metadata methods>
  // <MINTABLE methods>

  /**
   * Mint/creates an amount of tokens for the given address
   * @param {string} to - The address to mint to
   * @param {string} amount - The amount of tokens to mint.
   * @param {UnitTypes} unit - UnitTypes = UnitTypes.ETHER
   * @returns A promise that resolves to a transaction response.
   */
  async mint(
    to: string = isRequired('to'),
    amount: string = isRequired('amount'),
    unit: UnitTypes = UnitTypes.ETHER
  ): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'mint',
      params: [to, toWei(amount, unit)]
    })
    return transactionResponse!
  }

  // </MINTABLE methods>
  // <BURNABLE methods>

  /**
   * It burns tokens from the contract.
   * @param {string} amount - The amount of tokens to burn.
   * @param {string} [account] - The account that will be burning the tokens.
   * @param {UnitTypes} unit - UnitTypes = UnitTypes.ETHER
   * @returns A promise that resolves to a transaction response.
   */
  async burn(
    amount: string = isRequired('amount'),
    unit: UnitTypes = UnitTypes.ETHER
  ): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'burn',
      params: [toWei(amount, unit)]
    })
    return transactionResponse!
  }

  /**
   * `burnFrom` burns a specified amount of tokens from a specified account,
   * it also requires the owner of the tokens to previously approve the sender to spend the tokens.
   * @param {string} account - The account to burn from
   * @param {string} amount - The amount of tokens to burn.
   * @param {UnitTypes} unit - UnitTypes = UnitTypes.ETHER
   * @returns A transaction response object.
   */
  async burnFrom(
    account: string = isRequired('account'),
    amount: string = isRequired('amount'),
    unit: UnitTypes = UnitTypes.ETHER
  ): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'burnFrom',
      params: [account, toWei(amount, unit)]
    })
    return transactionResponse!
  }

  // </BURNABLE methods>
  // <PAUSABLE methods>

  /**
   * It pauses the contract.
   * @returns A promise that resolves to a transaction response.
   */
  async pause(): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'pause'
    })
    return transactionResponse!
  }

  /**
   * It Unpauses the contract.
   * @returns A promise that resolves to a transaction response.
   */
  async unpause(): Promise<TransactionResponse> {
    const { transactionResponse } = await this.execute({
      method: 'unpause'
    })
    return transactionResponse!
  }

  // </PAUSABLE methods>
  // <IERC2612 methods>

  /**
   * Sets `value` as the allowance of `spender` over `owner`'s tokens,
   * given `owner`'s signed approval based on the EIP2612.
   * @param {string} owner - The address of the owner of the tokens.
   * @param {string} spender - The address of the spender
   * @param {BigNumberish} value - The amount of tokens to approve
   * @param {BigNumberish} deadline - The deadline for the permit to be valid.
   * @param {number} v - The recovery ID.
   * @param {string} r - The signature's r value
   * @param {string} s - The signature's s value
   * @returns TransactionResponseExtended
   */
  async permit(
    owner: string = isRequired('owner'),
    spender: string = isRequired('spender'),
    value: BigNumberish = isRequired('value'),
    deadline: BigNumberish = isRequired('deadline'),
    v: number = isRequired('v'),
    r: string = isRequired('r'),
    s: string = isRequired('s')
  ): Promise<TransactionResponseExtended> {
    const { transactionResponse } = await this.execute({
      method: 'permit',
      params: [owner, spender, value, deadline, v, r, s]
    })
    return transactionResponse!
  }

  /**
   * It returns the nonce of the owner.
   * @param {string} owner - The address of the account to get the nonce for.
   * @returns The nonce of the account.
   */
  async nonces(owner: string = isRequired('owner')): Promise<BigNumber> {
    const { value } = await this.execute({
      method: 'nonces',
      params: [owner]
    })
    return value
  }

  /**
   * It returns the domain separator of the contract.
   * @returns The domain separator of the contract.
   */
  async domainSeparator(): Promise<string> {
    const { value } = await this.execute({
      method: 'DOMAIN_SEPARATOR'
    })
    return value
  }

  // </IERC2612 methods>
}
