/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BigNumber, BigNumberish, ethers, Signature, Wallet } from 'ethers'
import errorTypes from '../types/errors'
import {
  TransactionResponseExtended,
  TransactionResponse
} from '../types/interfaces'
import { parseFixed } from '@ethersproject/bignumber'
import { UnitTypes } from '../types/enums'
import {
  isBigNumber,
  isFloatNumber,
  isRequired,
  matchType
} from '../utils/validations'
import { extendTransactionResponse, fromWei } from '../utils/conversions'
import { EIP2612PermitTypedDataSigner } from '../utils/typed-data'

export default abstract class AbstractWeb3Connector {
  protected _provider:
    | ethers.providers.Web3Provider
    | ethers.providers.JsonRpcProvider
    | ethers.providers.WebSocketProvider
    | undefined
  protected _account: ethers.providers.JsonRpcSigner | Wallet | undefined
  protected _chainId: number | undefined
  protected _isActive = false
  protected _speedUpPercentage = 10 // default to 10%
  protected _isLegacy: boolean | undefined // EIP-1559

  abstract activate(): Promise<{
    provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
    chainId: number
    account: ethers.providers.JsonRpcSigner | Wallet | undefined
  }>

  async deactivate() {
    this._account = undefined
    this._chainId = undefined
    this._provider = undefined
    this._isActive = false
    this._isLegacy = undefined
  }

  /**
   * If the account is undefined, then the account is read-only
   * @returns A boolean value.
   */
  get isReadOnly(): boolean {
    return this._account == undefined
  }

  /**
   * It signs a message with the account's private key
   * @param {string} nonce - A random string that is used to prevent replay attacks.
   * @returns A promise that resolves to a string.
   */
  signMessage = async (nonce: string): Promise<string> => {
    if (!this._isActive) {
      throw errorTypes.MUST_ACTIVATE
    }
    if (this.isReadOnly) throw errorTypes.READ_ONLY('signMessage')
    return await this._account!.signMessage(nonce)
  }

  get isActive(): boolean {
    return this._isActive
  }

  get provider():
    | ethers.providers.Web3Provider
    | ethers.providers.JsonRpcProvider
    | undefined {
    return this._provider
  }

  get account(): ethers.providers.JsonRpcSigner | Wallet | undefined {
    return this._account
  }

  get chainId(): number | undefined {
    return this._chainId
  }

  get speedUpPercentage(): number {
    return this._speedUpPercentage
  }

  set speedUpPercentage(value: number) {
    this._speedUpPercentage = value
  }

  get isLegacy(): boolean | undefined {
    return this._isLegacy
  }

  /**
   * This function takes a transaction hash as a string and returns a promise that resolves to an
   * object containing the transaction details or null if the transaction hash is invalid
   * @param {string} txHash - The transaction hash of the transaction you want to get.
   * @returns A promise that resolves to a TransactionResponse or null.
   */
  getTransaction = async (
    txHash: string
  ): Promise<TransactionResponse | null> => {
    if (!this._isActive) {
      throw errorTypes.MUST_ACTIVATE
    }
    return this._provider!.getTransaction(txHash)
  }

  /**
   * It returns the balance of the address passed as a parameter.
   * @param {string} address - The address of the account you want to get the balance of.
   * @returns A promise that resolves to a string of balance expressed in ether.
   */
  getBalance = async (address: string): Promise<string> => {
    if (!this._isActive) {
      throw errorTypes.MUST_ACTIVATE
    }
    const balance = await this._provider?.getBalance(address)
    return fromWei(balance!, UnitTypes.ETHER)
  }

  /**
   * It takes an amount and a destination address, and sends the amount to the destination address
   * @param {string} amount - The amount of ETH to transfer.
   * @param {string} destinationAddress - The address of the recipient.
   * @returns The transaction hash and a function to call the receipt of the transaction once there
   * are enough confirmations.
   */
  transferBalance = async (
    amount: string,
    destinationAddress: string
  ): Promise<TransactionResponseExtended> => {
    // doing import inside function to avoid circular dependency
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    if (!this._isActive) {
      throw errorTypes.MUST_ACTIVATE
    }
    if (this.isReadOnly) throw errorTypes.READ_ONLY('transferBalance')
    if (!isFloatNumber(amount)) throw errorTypes.NOT_A_NUMBER('amount')
    const tx = {
      to: destinationAddress,
      value: parseFixed(amount, UnitTypes.ETHER)
    }
    const txResponse = await this._account!.sendTransaction(tx)
    return extendTransactionResponse(txResponse, this)
  }

  /**
   * If the transaction has a maxPriorityFeePerGas, add 10% to it. Otherwise, add 10% to the gasPrice
   * @param {TransactionResponse} tx - TransactionResponse
   * @param {BigNumber} [gasSpeed] - If the chain is EIP-1559, this is the gas price you
   * want to use for the transaction. If not, this is the maxPriorityFeePerGas. If you don't specify
   * this, the SDK will use the current gas price/maxPriorityFeePerGas.
   * @returns an object containing the maxPriorityFeePerGas with a 10% increment and the nonce or the
   * gasPrice with a 10% increment and a nonce
   */
  _speedUpGas = (tx: TransactionResponse, gasSpeed?: BigNumber): any => {
    const originalPrice: BigNumberish = tx.maxPriorityFeePerGas ?? tx.gasPrice!
    if (tx.maxPriorityFeePerGas) {
      // chain with EIP-1559 support
      // add 10% of gas to max priority if gasSpeed is not defined
      const maxPriorityFeePerGas =
        gasSpeed ??
        tx.maxPriorityFeePerGas
          .mul(this.speedUpPercentage)
          .div(100)
          .add(originalPrice)
      return {
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        gasLimit: tx.gasLimit,
        maxFeePerGas: maxPriorityFeePerGas.add(10),
        nonce: tx.nonce
      }
    } else {
      // chain with no support for EIP-1559
      // add 10% of gas to gasPrice if gasSpeed is not defined
      return {
        gasPrice:
          gasSpeed ??
          tx.gasPrice!.mul(this.speedUpPercentage).div(100).add(originalPrice),
        gasLimit: tx.gasLimit,
        nonce: tx.nonce
      }
    }
  }

  /**
   * It cancels a transaction by sending a transaction with value 0, the same nonce and the more
   * gasPrice/maxPriorityFeePerGas.
   * @param {TransactionResponse} txReceipt - TransactionResponse
   * @param {BigNumber} [gasSpeed] - If the chain is EIP-1559, this is the gas price you
   * want to use for the transaction. If not, this is the maxPriorityFeePerGas. If you don't specify
   * this, the SDK will use the current gas price/maxPriorityFeePerGas.
   * @returns A promise that resolves to a TransactionResponse wich cancels the transaction.
   */
  cancelTransaction = async (
    txReceipt: TransactionResponse,
    gasSpeed?: BigNumber
  ): Promise<TransactionResponse> => {
    if (!this._isActive) {
      throw errorTypes.MUST_ACTIVATE
    }
    if (this.isReadOnly) throw errorTypes.READ_ONLY('cancelTransaction')
    const speedUp = this._speedUpGas(txReceipt, gasSpeed)

    return await this._account!.sendTransaction({
      from: txReceipt.from,
      to: txReceipt.from,
      value: BigNumber.from('0'),
      ...speedUp
    })
  }

  /**
   * It takes a transaction receipt and a gas price, and if the gas price is undefined, it calls the
   * speedUpGas function to get a gas price, and then it sends the transaction with the new gas price
   * @param {TransactionResponse} txReceipt - TransactionResponse - The transaction receipt that you
   * want to speed up.
   * @param {BigNumber} [gasSpeed] - If the chain is EIP-1559, this is the gas price you
   * want to use for the transaction. If not, this is the maxPriorityFeePerGas. If you don't specify
   * this, the SDK will use the current gas price/maxPriorityFeePerGas.
   * @returns A transaction response object.
   */
  speedUpTransaction = async (
    txReceipt: TransactionResponse,
    gasSpeed?: BigNumber
  ): Promise<TransactionResponse> => {
    if (!this._isActive) {
      throw errorTypes.MUST_ACTIVATE
    }
    if (this.isReadOnly) throw errorTypes.READ_ONLY('speedUpTransaction')
    const speedUp = await this._speedUpGas(txReceipt, gasSpeed)
    return this._account!.sendTransaction({
      from: txReceipt.from,
      to: txReceipt.to,
      value: txReceipt.value,
      data: txReceipt.data,
      ...speedUp
    })
  }

  /**
   * It takes a transaction receipt, an interface, new parameters, and a gas speed, and sends a new
   * transactionreturns with its params modified, and a new transaction receipt.
   * @param {TransactionResponse} txReceipt - The transaction receipt that you want to change.
   * @param iface - The Interface object of the contract you want to change the transaction of.
   * @param newParams - An object with the new parameters you want to change.
   * @param {BigNumber} [gasSpeed] - The speed at which you want to send the transaction.
   * @returns A promise that resolves to a TransactionResponse
   */
  changeTransaction = async (
    txReceipt: TransactionResponse = isRequired('txReceipt'),
    iface: ethers.utils.Interface = isRequired('iface'),
    newParams: Record<string, any> = isRequired('newParams'),
    gasSpeed?: BigNumber
  ): Promise<TransactionResponse> => {
    if (!this._isActive) {
      throw errorTypes.MUST_ACTIVATE
    }
    if (this.isReadOnly) throw errorTypes.READ_ONLY('changeTransaction')
    const decodedData = iface.parseTransaction(txReceipt)
    const inputs = decodedData.functionFragment.inputs
    // validate that provided params belong to the function
    // check every param's type
    Object.entries(newParams).forEach((param: Record<string, any>) => {
      // check if param exists in fragment
      const inputParam = inputs.find((input: any) => input.name === param[0])
      if (!inputParam) {
        throw errorTypes.INVALID_PARAMETER(param[0])
      }

      // type of user's input
      const paramType = typeof param[1]
      // type of abi's contract input matching to js types
      const abiParamType = matchType(inputParam.type)
      if (abiParamType !== null && paramType !== abiParamType) {
        if (abiParamType !== 'number')
          throw errorTypes.INVALID_PARAM_TYPE(param[0], abiParamType, paramType)
        // Checking if the parameter is BigNumberish.
        else if (abiParamType === 'number' && !isBigNumber(param))
          throw errorTypes.NOT_BIGNUMBERISH(param[0])
      }
    })
    // get new arguments and replace previous ones with new ones if they where provided
    const newArgs = inputs.map(
      (input: any) => newParams[input.name] ?? decodedData.args[input.name]
    )

    // encode the new params to the transaction using encodeFunctionData
    const newData = iface.encodeFunctionData(
      decodedData.functionFragment,
      newArgs
    )

    const speedUp = await this._speedUpGas(txReceipt, gasSpeed)
    return this._account!.sendTransaction({
      from: txReceipt.from,
      to: txReceipt.to,
      value: txReceipt.value,
      data: newData,
      ...speedUp
    })
  }

  signTypedData = async (
    instance: EIP2612PermitTypedDataSigner
  ): Promise<Signature> => {
    if (!this._isActive) throw errorTypes.MUST_ACTIVATE
    if (this.isReadOnly) throw errorTypes.READ_ONLY('signTypedData')
    return await instance.sign(this._account!)
  }

  /**
   * Sets the value of _isLegacy depending on the values of ethers.getFeeData
   * @returns A void promise
   */
  detectLegacyChain = async (): Promise<void> => {
    if (!this._isActive) {
      throw errorTypes.MUST_ACTIVATE
    }

    // check the value of maxFeePerGas to see if it supports EIP-1559
    const { maxFeePerGas } = await this._provider!.getFeeData()
    this._isLegacy = maxFeePerGas === null
  }
}
