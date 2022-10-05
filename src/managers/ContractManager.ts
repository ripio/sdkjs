/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ethers, Contract, Wallet } from 'ethers'
import { ParamType } from 'ethers/lib/utils'
import EventEmitter from 'events'
import {
  matchType,
  requireParam,
  isBigNumber,
  isFloatNumber,
  FilterEvent
} from '../utils/validations'
import errorTypes from '../types/errors'
import { ProviderEvents } from '../connectors/events'
import {
  abiEventInterface,
  ConnectInfo,
  ExecuteFunctionOptions,
  ProviderRpcError,
  ContractEvents,
  ValueInput,
  ExecuteResponse
} from '../types/interfaces'
import { getExecuteResponse, toWei } from '../utils/conversions'
import { getConnector } from '../utils/connectors'
import { BrowserWeb3Connector, JsonRPCWeb3Connector } from '../connectors'
import { Event } from '@ethersproject/contracts'

export class ContractManager {
  protected ContractManagerEmitter = new EventEmitter()

  protected _abi: ethers.utils.Interface | undefined
  protected _contract: Contract | undefined
  protected _contractAddr: string | undefined
  protected _connector: BrowserWeb3Connector | JsonRPCWeb3Connector | undefined
  protected _contractEvents: Array<ContractEvents> | undefined

  protected _isActivating = false
  protected _isActive = false
  public safeMode = true

  // listener handlers
  addListener(event: string, listener: (...args: any[]) => void): () => void {
    this.ContractManagerEmitter.on(event, listener)
    return () => this.ContractManagerEmitter.removeListener(event, listener)
  }
  on(event: string, listener: (...args: any[]) => void): () => void {
    return this.addListener(event, listener)
  }
  once(event: string, listener: (...args: any[]) => void): () => void {
    this.ContractManagerEmitter.once(event, listener)
    return () => this.ContractManagerEmitter.removeListener(event, listener)
  }
  removeListener(event: string, listener: (...args: any[]) => void) {
    return this.ContractManagerEmitter.removeListener(event, listener)
  }
  removeAllListeners(event?: string) {
    return this.ContractManagerEmitter.removeAllListeners(event)
  }
  off(event: string, listener: (...args: any[]) => void) {
    return this.removeListener(event, listener)
  }

  /**
   * It subscribes to an event on the blockchain. If values is provided, a filter is created.
   * @param {string} event - The name of the event you want to subscribe to.
   * @param callback - This is the function that will be called when the event is triggered.
   * @param {Array<any> | null} values - This are the values by which to filter the inputs of event.
   */
  subscribeToEvent(
    event: string,
    callback: (...args: Array<any>) => void,
    values: Array<ValueInput> | null = null
  ): void {
    requireParam(this._contract, errorTypes.SDK_NOT_INITIALIZED)
    const filterBy = new FilterEvent(event, values)
    this._contract?.on(filterBy.getEventOrFilter(this._contract), callback)
  }

  /**
   * It unsubscribes to an event.
   * @param {string} event - The name of the event you want to listen to.
   * @param callback - The function that will be called when the event is triggered.
   * @param {Array<ValueInput> | null} [values=null] - Array<ValueInput> | null = null
   */
  unsubscribeToEvent(
    event: string,
    callback: (...args: Array<any>) => void,
    values: Array<ValueInput> | null = null
  ): void {
    requireParam(this._contract, errorTypes.SDK_NOT_INITIALIZED)
    const filterBy = new FilterEvent(event, values)
    this._contract?.off(filterBy.getEventOrFilter(this._contract), callback)
  }

  /**
   * It returns an array of events between the provided blocks.
   * @param {string} event - The name of the event you want to query.
   * @param {number} fromBlock - The block number to start looking for events from.
   * @param {number | string} [toBlock=latest] - The block number to end looking for events from. Default to 'latest'
   * @param values - Array<ValueInput> = []
   * @returns An array of events
   */
  eventsBetweenBlocks(
    event: string,
    fromBlock: number,
    toBlock: number | string = 'latest',
    values: Array<ValueInput> = []
  ): Promise<Array<Event>> {
    requireParam(this._contract, errorTypes.SDK_NOT_INITIALIZED)
    const filter = new FilterEvent(event, values)
    filter._validate(this.abi!)
    return this._contract!.queryFilter(
      filter._getFilterForContract(this._contract!),
      fromBlock,
      toBlock
    )
  }

  // provider handlers
  // this events are emmited by the provider (AbstractWeb3Connector)
  protected handleAccountChanged = (
    account: ethers.providers.JsonRpcSigner | Wallet | undefined
  ) => {
    if (!this._isActive) throw errorTypes.SDK_NOT_INITIALIZED
    const signerOrProvider = account ?? this._connector?.provider
    this._contract = new Contract(
      this._contractAddr!,
      this._abi!,
      signerOrProvider
    )
    this.ContractManagerEmitter.emit(ProviderEvents.ACCOUNT_CHANGED, account)
  }
  protected handleChainChanged = (chainId: number) => {
    this.ContractManagerEmitter.emit(ProviderEvents.CHAIN_CHANGED, chainId)
  }
  protected handleConnect = (connectInfo: ConnectInfo) => {
    this.ContractManagerEmitter.emit(ProviderEvents.CONNECT, connectInfo)
  }
  protected handleDisconnect = (error: ProviderRpcError) => {
    this.deactivate()
    this.ContractManagerEmitter.emit(ProviderEvents.DISCONNECT, error)
  }

  /**
   * It takes in a providerUrl, privateKey, and connector, and saves the selected connector.
   * @param {string | undefined} providerUrl - The websocket URL of the provider you want to use.
   * @param {string | undefined} privateKey - The private key of the account you want to use.
   * @param {BrowserWeb3Connector | JsonRPCWeb3Connector | undefined} connector - BrowserWeb3Connector | JsonRPCWeb3Connector | undefined
   */
  protected selectConnector(
    providerUrl: string | undefined,
    privateKey: string | undefined,
    connector: BrowserWeb3Connector | JsonRPCWeb3Connector | undefined
  ): void {
    if (!connector) {
      const connectorOptions = {
        providerUrl,
        privateKey
      }
      this._connector = getConnector(connectorOptions)
    } else {
      if (!connector.isActive || !connector.provider) {
        throw errorTypes.PROVIDER_NOT_INITIALIZED
      }
      this._connector = connector
    }
  }

  /**
   * Validate standard, implement in subclass if necessary.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateStandard(): void {}

  /**
   * async activator for ContractManager
   * @param  {string} contractAddress contract address
   * @param  {Array<any>} contractAbi parsed json object of contract's abi
   * @param  {string} providerUrl websocket provider url to connect to the provider
   * @param  {string} privateKey private key to sign transactions
   * @param  {AbstractWeb3Connector} connector provider to use in the contract. Must be subclass of AbstractWeb3Connector.
   * @return {Promise<void>} returns an activation promise ContractManager
   */
  async activate({
    contractAddress,
    contractAbi,
    providerUrl,
    privateKey,
    connector
  }: {
    contractAddress: string
    contractAbi: Array<any>
    providerUrl?: string
    privateKey?: string
    connector?: BrowserWeb3Connector | JsonRPCWeb3Connector
  }) {
    if (this._isActivating) throw errorTypes.SDK_ACTIVATION_IN_PROGRESS
    this._isActivating = true
    try {
      this.selectConnector(providerUrl, privateKey, connector)
      if (!this._connector?.isActive) {
        await this._connector!.activate()
      }

      // at this point provider is going to have a value
      this._connector!.provider!.on(
        ProviderEvents.ACCOUNT_CHANGED,
        this.handleAccountChanged
      )
      this._connector!.provider!.on(
        ProviderEvents.CHAIN_CHANGED,
        this.handleChainChanged
      )
      this._connector!.provider!.on(ProviderEvents.CONNECT, this.handleConnect)
      this._connector!.provider!.on(
        ProviderEvents.DISCONNECT,
        this.handleDisconnect
      )

      const signerOrProvider =
        this._connector!.account ?? this._connector!.provider
      // Contract
      this._abi = new ethers.utils.Interface(contractAbi)
      this.validateStandard()
      this._contractAddr = contractAddress
      this._contract = new Contract(
        contractAddress,
        this._abi,
        signerOrProvider!
      )
      this._isActive = true
    } catch (error: any) {
      throw errorTypes.SDK_ACTIVATION_FAILED(error)
    } finally {
      this._isActivating = false
    }
  }

  /**
   * Deactivates the connector. Unset provider, account, contract. Remove listeners. Change status of activating if is activating.
   * @return  {void}
   */
  deactivate() {
    if (this._isActivating) throw errorTypes.SDK_ACTIVATION_IN_PROGRESS

    if (this._isActive) {
      this._connector!.provider!.removeListener(
        ProviderEvents.ACCOUNT_CHANGED,
        this.handleAccountChanged
      )
      this._connector!.provider!.removeListener(
        ProviderEvents.CHAIN_CHANGED,
        this.handleChainChanged
      )
      this._connector!.provider!.removeListener(
        ProviderEvents.CONNECT,
        this.handleConnect
      )
      this._connector!.provider!.removeListener(
        ProviderEvents.DISCONNECT,
        this.handleDisconnect
      )
    }

    this._connector = undefined
    this._contract = undefined
    this._isActive = false
    this._abi = undefined
  }

  /**
   * call a function on the contract
   * @param  {ExecuteFunctionOptions} { method, value, params = [], overrides = {} }
   * @return {Promise<ExecuteResponse>} returns a promise with an ExecuteResponse.
   */
  async execute({
    method,
    value,
    params = [],
    overrides = {}
  }: ExecuteFunctionOptions): Promise<ExecuteResponse> {
    requireParam(
      [this._connector?.provider, this._contract, this._abi],
      errorTypes.SDK_NOT_INITIALIZED
    )
    let iFunction
    try {
      // attempts to get function from abi
      iFunction = this._abi!.getFunction(method)
    } catch {
      const checkOverflow = method.match(/^(.+)\((.*)\)$/)
      if (!checkOverflow) throw errorTypes.UNKNOWN_METHOD(method)
      const [, methodName] = checkOverflow
      // get suggestions of functions
      const posibleMethods = Object.keys(this._contract!)
        .filter((contractMethod: string) =>
          contractMethod.startsWith(methodName.trim())
        )
        .join(', ')
      if (posibleMethods)
        throw errorTypes.UNKNOWN_METHOD_WITH_RECOMENDATION(
          method,
          posibleMethods
        )
      throw errorTypes.UNKNOWN_METHOD(method)
    }

    // start validations
    if (iFunction.payable && value === undefined)
      throw errorTypes.PAYABLE_METHOD_REQUIRED_VALUE

    if (!iFunction.payable && value !== undefined)
      throw errorTypes.NOT_PAYABLE_METHOD_WITH_VALUE_PROVIDED

    if (iFunction.payable && value && !isFloatNumber(value))
      throw errorTypes.INVALID_VALUE_TYPE

    if (overrides?.gasLimit && !isBigNumber(overrides?.gasLimit))
      throw errorTypes.INVALID_PARAMETER('gasLimit')

    if (overrides?.gasPrice && !isBigNumber(overrides?.gasPrice))
      throw errorTypes.INVALID_PARAMETER('gasPrice')

    if (iFunction.inputs.length !== params.length)
      throw errorTypes.INVALID_PARAMETER_COUNT(
        iFunction.inputs.length,
        params.length
      )

    const errors: Array<Error> = []
    iFunction.inputs.forEach((abiParam: ParamType, index) => {
      // check every param's type
      const param = params[index]
      // type of user's input
      const paramType = typeof param
      // type of abi's contract input matching to js types
      const abiParamType = matchType(abiParam.type)
      // if abi param type and user param type don't match throw an error
      if (abiParamType !== null && paramType !== abiParamType) {
        if (abiParamType !== 'number')
          errors.push(
            errorTypes.INVALID_PARAM_TYPE(
              abiParam.name,
              abiParamType,
              paramType
            )
          )
        // Checking if the parameter is BigNumberish.
        else if (abiParamType === 'number' && !isBigNumber(param))
          errors.push(errorTypes.NOT_BIGNUMBERISH(abiParam.name))
        return
      }
    })
    if (errors.length) throw errors
    // end validations

    // preparing transaction parameters
    const txParams = iFunction.inputs.map(
      (input: ParamType, index) => params[index]
    )

    const options = {
      value: value !== undefined ? toWei(value) : undefined,
      ...overrides
    }
    const methodName = iFunction.format()

    try {
      if (this.safeMode) {
        // if safe mode is enabled, determine if a transaction will fail or succeed without cost
        await this._contract!.callStatic[methodName](...txParams, options)
      }
      // call contract's method with params
      const txResponse = await this._contract![methodName](...txParams, options)
      return getExecuteResponse(txResponse, this._connector!, this._abi!)
    } catch (error: any) {
      throw errorTypes.TRANSACTION_FAILED(error)
    }
  }

  // getters
  get connector(): BrowserWeb3Connector | JsonRPCWeb3Connector | undefined {
    return this._connector
  }

  get abi(): ethers.utils.Interface | undefined {
    return this._abi
  }

  get contract(): ethers.Contract | undefined {
    return this._contract
  }

  get contractAddr(): string | undefined {
    return this._contractAddr
  }

  get isReadonly(): boolean | null {
    if (this._contract?.signer && this._contract?.provider) return false
    if (this._contract?.provider) return true
    return null
  }

  get isActive(): boolean {
    return this._isActive
  }

  get contractEvents(): Array<ContractEvents> {
    // workaround of a cached property. We could process this on the activate method,
    // but user may never use this, making it unnecesary to always define it in the activate.
    if (!this._contractEvents) {
      this._contractEvents = Object.values(this._abi!['events']).map(
        (e: abiEventInterface) => {
          return { name: e.name, inputs: e.inputs }
        }
      )
    }
    return this._contractEvents
  }
  // end getters
}
