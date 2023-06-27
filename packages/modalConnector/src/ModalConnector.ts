/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserWeb3Connector, errors } from '@ripio/sdk'
import { providers } from 'ethers'
import ETHProvider, { EthereumProvider } from '@walletconnect/ethereum-provider'

/**
 * @class ModalConnector
 * @description This class extends the BrowserWeb3Connector class from the @ripio/sdk/connectors package.
 * It's designed to help connect a Web3 provider to a wallet using WalletConnect.
 * @extends {BrowserWeb3Connector}
 */
export default class ModalConnector extends BrowserWeb3Connector {
  private _chains: number[] = []
  private _projectId: string
  private _walletConnectProvider: ETHProvider | undefined

  /**
   * Constructs a new ModalConnector instance.
   * @param {Object} options - The configuration options.
   * @param {string} options.projectId - The project ID.
   * @param {number[]} options.chains - The chains to connect to.
   * @param {boolean} [options.requestAccount=true] - Whether to request the account upon activation.
   */
  constructor({
    projectId,
    chains,
    requestAccount = true
  }: {
    projectId: string,
    chains: number[],
    requestAccount?: boolean
  }) {
    super(requestAccount)
    this._projectId = projectId
    this._chains = chains
  }

  /**
   * Activates the connection to the wallet. If the `requestAccount` property set in the constructor is `true`,
   * this method will trigger WalletConnect to open a modal for the user to select their wallet and connect to it.
   * @returns {Promise<Object>} - A promise that resolves to an object containing the following:
   *    - `provider`: The Web3Provider instance that represents the connected wallet provider.
   *    - `chainId`: The ID of the chain that the provider is connected to.
   *    - `account`: A JsonRpcSigner instance that represents the user's account, or `undefined` if no account was connected.
  */
  async activate (): Promise<{
    provider: providers.Web3Provider
    chainId: number
    account: providers.JsonRpcSigner | undefined
  }> {

    this._walletConnectProvider = await EthereumProvider.init({
      projectId: this._projectId,
      chains: this._chains,
      showQrModal: true
    })

    const provider = new providers.Web3Provider(this._walletConnectProvider)
    this._provider = provider
    this.subscribeToEvents(this._walletConnectProvider)

    if (this._requestAccount) await this.requestAccount()

    const chain = await provider.getNetwork()

    this._chainId = chain.chainId
    this._isActive = true

    return {
      provider: provider,
      chainId: this._chainId,
      account: this._account as providers.JsonRpcSigner,
    }
  }

  /**
   * Requests access to the user's account.
   * @throws {Error} - If no provider is available, or if no account is recovered.
  */
  async requestAccount() {
    if (
      !this.provider ||
      !this.walletConnectProvider
    )
      throw errors.NO_PROVIDER
    let accounts: string[]

    try {
      accounts = await this.walletConnectProvider.enable()
    } catch (error: any) {
      throw errors.NO_ACCOUNT(error)
    }
    if (accounts.length === 0)
      throw errors.NO_ACCOUNT(new Error('No accounts recovered.'))
    const account = accounts[0].toLowerCase()
    this._account = this.provider.getSigner(account)
  }

  /**
   * Deactivates the connection to the wallet.
   * @throws {Error} - If no Ethereum provider is available.
  */
  async deactivate() {
    if (!this.provider || !this.walletConnectProvider)
      throw errors.NO_ETHEREUM

    this.unsubscribeFromEvents(this.provider)
    await this.walletConnectProvider.disconnect()

    this._account = undefined
    this._chainId = undefined
    this._provider = undefined
    this._isActive = false
    this._isLegacy = undefined
    this._walletConnectProvider = undefined
    this._requestAccount = false
    this._projectId = ''
    this._chains = []
  }

  /**
   * Getter for the WalletConnect provider.
   * @returns {ETHProvider | undefined} - The WalletConnect provider.
   */
  get walletConnectProvider(): ETHProvider | undefined {
    return this._walletConnectProvider
  }
}
