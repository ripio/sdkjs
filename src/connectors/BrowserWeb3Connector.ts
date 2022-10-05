/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers'
import AbstractWeb3Connector from './AbstractWeb3Connector'
import { ProviderEvents } from './events'
import errors from '../types/errors'
import {
  AddEthereumChainParameter,
  ConnectInfo,
  ProviderRpcError
} from '../types/interfaces'
import { hexToNumber } from '../utils/conversions'

export default class BrowserWeb3Connector extends AbstractWeb3Connector {
  private _requestAccount: boolean
  constructor(requestAccount = true) {
    super()
    this._requestAccount = requestAccount
  }

  /**
   * Activates provider with window.ethereum, sets the chainId, account (signer), and provider.
   * Then subscribe to events.
   * @returns {object} provider, chainId and account
   */
  async activate(): Promise<{
    provider: ethers.providers.Web3Provider
    chainId: number
    account: ethers.providers.JsonRpcSigner | undefined
  }> {
    if (!window.ethereum) throw errors.NO_ETHEREUM
    const web3_provider = new ethers.providers.Web3Provider(window.ethereum)
    const { chainId } = await web3_provider.getNetwork()
    this._chainId = chainId
    this._provider = web3_provider
    if (this._requestAccount) {
      // if _requestAccount was left as true (default value), request account, else, leave account null.
      await this.requestAccount()
    }
    this.subscribeToEvents(window.ethereum)
    this._isActive = true

    return {
      provider: <ethers.providers.Web3Provider>this._provider,
      chainId,
      account: <ethers.providers.JsonRpcSigner>this._account
    }
  }

  subscribeToEvents(provider: any) {
    if (provider && provider.on) {
      provider.on(ProviderEvents.ACCOUNT_CHANGED, this.handleAccountChanged)
      provider.on(ProviderEvents.CHAIN_CHANGED, this.handleChainChanged)
      provider.on(ProviderEvents.DISCONNECT, this.handleDisconnect)
      provider.on(ProviderEvents.CONNECT, this.handleConnect)
    }
  }

  unsubscribeFromEvents(provider: any) {
    if (provider && provider.removeListener) {
      provider.removeListener(
        ProviderEvents.ACCOUNT_CHANGED,
        this.handleAccountChanged
      )
      provider.removeListener(
        ProviderEvents.CHAIN_CHANGED,
        this.handleChainChanged
      )
      provider.removeListener(ProviderEvents.DISCONNECT, this.handleDisconnect)
      provider.removeListener(ProviderEvents.CONNECT, this.handleConnect)
    }
  }

  /**
   * Handle the change of account in metamask and emits ACCOUNT_CHANGED event
   * @param accounts array of strings of accounts/addresses that metamask injects
   */
  protected handleAccountChanged = (accounts: string[]) => {
    if (
      !this._provider ||
      !(this._provider instanceof ethers.providers.Web3Provider)
    )
      throw errors.NO_PROVIDER

    if (accounts.length === 0) {
      this._account = undefined
    } else {
      const account = accounts[0].toLowerCase()
      this._account = this._provider.getSigner(account)
    }
    this._provider.emit(ProviderEvents.ACCOUNT_CHANGED, this._account)
  }

  protected handleChainChanged = (chainId: string) => {
    const chainNumber = hexToNumber(chainId)
    this._chainId = chainNumber
    this._provider?.emit(ProviderEvents.CHAIN_CHANGED, chainNumber)
  }

  protected handleConnect = (connectInfo: ConnectInfo) => {
    this._provider?.emit(ProviderEvents.CONNECT, connectInfo)
  }

  protected handleDisconnect = (error: ProviderRpcError) => {
    this._provider?.emit(ProviderEvents.DISCONNECT, error)
  }

  async deactivate() {
    if (!window.ethereum) throw errors.NO_ETHEREUM

    this.unsubscribeFromEvents(window.ethereum)
    super.deactivate()
  }

  /**
   * It switches the current chain to the one specified by the user
   * @param {number} chainId - The chain ID of the chain you want to switch to.
   * @returns a promise that resolves when the chain has been switched.
   */
  async switchChain(chainId: number) {
    if (chainId === this._chainId) return
    if (
      !this._provider ||
      !(this._provider instanceof ethers.providers.Web3Provider)
    )
      throw errors.NO_PROVIDER
    await this._provider.send('wallet_switchEthereumChain', [
      {
        chainId: ethers.utils.hexValue(chainId)
      }
    ])
  }

  /**
   * It adds a new chain to the wallet.
   * @param {number} chainId - The chain ID of the chain you want to add.
   * @param {string} chainName - The name of the chain, e.g. "Kovan"
   * @param {string[] | string} rpcUrl - The RPC URL of the chain.
   * @param {string} currencyName - The name of the currency, e.g. "Ether"
   * @param {string} currencySymbol - The symbol of the currency, e.g. "ETH"
   * @param {string[] | string} [blockExplorerUrls] - An array of URLs to block explorers for this
   * chain.
   */
  async addChain(
    chainId: number,
    chainName: string,
    rpcUrl: string[] | string,
    currencyName: string,
    currencySymbol: string,
    blockExplorerUrls?: string[] | string
  ) {
    if (
      !this._provider ||
      !(this._provider instanceof ethers.providers.Web3Provider)
    )
      throw errors.NO_PROVIDER
    await this._provider.send('wallet_addEthereumChain', [
      {
        chainId: ethers.utils.hexValue(chainId),
        chainName,
        nativeCurrency: {
          name: currencyName,
          symbol: currencySymbol,
          decimals: 18
        },
        rpcUrls: typeof rpcUrl === 'string' ? [rpcUrl] : rpcUrl,
        blockExplorerUrls: blockExplorerUrls
          ? typeof blockExplorerUrls === 'string'
            ? [blockExplorerUrls]
            : blockExplorerUrls
          : undefined
      } as AddEthereumChainParameter
    ])
  }

  /**
   * It requests an account from the provider, and if it gets one, it sets the account property to the
   * signer of that account
   */
  async requestAccount() {
    if (
      !this._provider ||
      !(this._provider instanceof ethers.providers.Web3Provider)
    )
      throw errors.NO_PROVIDER
    let accounts
    try {
      accounts = await this._provider.send('eth_requestAccounts', [])
    } catch (error: any) {
      throw errors.NO_ACCOUNT(error)
    }
    if (accounts.length === 0)
      throw errors.NO_ACCOUNT(new Error('No accounts recovered.'))
    const account = accounts[0].toLowerCase()
    this._account = this._provider.getSigner(account)
  }
}
