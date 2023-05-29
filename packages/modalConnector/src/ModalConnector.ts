/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers'
import {
  configureChains,
  createClient,
  getProvider,
  getAccount,
  getNetwork,
  fetchSigner,
  disconnect,
  switchNetwork,
  mainnet,
  watchAccount,
  watchNetwork,
  GetAccountResult,
  GetNetworkResult,
  Chain,
  watchProvider,
  GetProviderResult
} from '@wagmi/core'
import { AbstractWeb3Connector } from '@ripio/sdk/connectors'
import { Web3Modal } from '@web3modal/html'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { errors } from '@ripio/sdk/types'

export default class ModalConnector extends AbstractWeb3Connector {
  web3Modal: Web3Modal
  private _requestAccount: boolean
  private _events: Array<CallableFunction> = []

  constructor(
    projectId: string,
    chains: Chain[] | Chain = [mainnet],
    requestAccount = true
  ) {
    super()
    this._requestAccount = requestAccount

    const _chains: Chain[] = Array.isArray(chains) ? chains : [chains]
    // Wagmi Core Client
    const { provider } = configureChains(_chains, [w3mProvider({ projectId })])

    const wagmiConfig = createClient({
      autoConnect: true,
      connectors: w3mConnectors({
        projectId,
        version: 1,
        chains: _chains
      }),
      provider
    })

    // Web3Modal and Ethereum Client
    const ethereumClient = new EthereumClient(wagmiConfig, _chains)
    this.web3Modal = new Web3Modal({ projectId }, ethereumClient)
  }

  /**
   * It activates the provider, sets the chainId, requests an account, subscribes to events, and
   * detects the legacy chain
   * @returns {object} provider, chainId and account
   */
  async activate(): Promise<{
    provider: ethers.providers.StaticJsonRpcProvider
    chainId: number
    account: ethers.providers.JsonRpcSigner | ethers.Wallet | undefined
  }> {
    this._provider = getProvider<ethers.providers.StaticJsonRpcProvider>()
    const { chain } = getNetwork()
    this._chainId = chain?.id
    if (this._requestAccount) {
      // if _requestAccount was left as true (default value), request account, else, leave account null.
      await this.requestAccount()
    }
    this.subscribeToEvents()
    this._isActive = true
    await this.detectLegacyChain()

    return {
      provider: <ethers.providers.StaticJsonRpcProvider>this._provider,
      chainId: <number>this.chainId,
      account: <ethers.providers.JsonRpcSigner>this._account
    }
  }

  async deactivate(): Promise<void> {
    this.unsubscribeFromEvents()
    await super.deactivate()
    await disconnect()
  }

  subscribeToEvents() {
    this._events.push(
      watchAccount(this.handleAccountChanged),
      watchNetwork(this.handleChainChanged),
      watchProvider({}, this.handleProviderChanged)
    )
  }

  protected handleAccountChanged = async (account: GetAccountResult) => {
    this._account = account.isConnected
      ? <ethers.providers.JsonRpcSigner>await fetchSigner()
      : undefined
  }

  protected handleChainChanged = async (network: GetNetworkResult) => {
    this._chainId = network.chain ? network.chain.id : undefined
    await this.detectLegacyChain()
  }

  protected handleProviderChanged = async (provider: GetProviderResult) => {
    this._provider = <ethers.providers.StaticJsonRpcProvider>provider
  }

  /**
   * Unsuscribe from all events
   */
  unsubscribeFromEvents() {
    this._events.forEach(unwatch => unwatch())
    this._events = []
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
      !(this._provider instanceof ethers.providers.StaticJsonRpcProvider)
    )
      throw errors.NO_PROVIDER
    await switchNetwork({ chainId })
  }

  /**
   * If the user is already connected to a wallet, fetch the signer, otherwise open the web3 modal
   */
  async requestAccount() {
    if (
      !this._provider ||
      !(this._provider instanceof ethers.providers.StaticJsonRpcProvider)
    )
      throw errors.NO_PROVIDER
    try {
      const { isConnected } = getAccount()
      if (isConnected)
        this._account = <ethers.providers.JsonRpcSigner>await fetchSigner()
      else await this.web3Modal.openModal()
    } catch (error: any) {
      throw errors.NO_ACCOUNT(error)
    }
  }
}
