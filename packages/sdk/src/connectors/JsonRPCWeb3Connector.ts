import { ethers, Wallet } from 'ethers'
import errors from '../types/errors'
import AbstractWeb3Connector from './AbstractWeb3Connector'

export default class JsonRPCWeb3Connector extends AbstractWeb3Connector {
  constructor(provider: string, privateKey?: string) {
    super()
    const regx = /wss:|ws:/gm
    this._provider = regx.test(provider)
      ? new ethers.providers.WebSocketProvider(provider)
      : new ethers.providers.JsonRpcProvider(provider)
    if (privateKey) {
      this._account = new Wallet(privateKey, this.provider)
    }
  }

  async activate(): Promise<{
    provider:
      | ethers.providers.WebSocketProvider
      | ethers.providers.JsonRpcProvider
    chainId: number
    account: Wallet | undefined
  }> {
    if (!this._provider) throw errors.PROVIDER_NOT_INITIALIZED
    const { chainId } = await this._provider.getNetwork()
    this._chainId = chainId
    this._isActive = true
    await this.detectLegacyChain()

    return {
      provider: this._provider,
      chainId: this._chainId,
      account: <Wallet>this._account
    }
  }

  async deactivate() {
    if (this._provider instanceof ethers.providers.WebSocketProvider) {
      this._provider.removeAllListeners()
      await this._provider.destroy()
    }
    await super.deactivate()
  }
}
