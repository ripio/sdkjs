/**
 * @jest-environment jsdom
 */
import { ethers, Wallet } from 'ethers'
import errors from '../../types/errors'
import BrowserWeb3Connector from '../../connectors/BrowserWeb3Connector'
import { ProviderEvents } from '../../connectors/events'
import AbstractWeb3Connector from '../../connectors/AbstractWeb3Connector'
import { AddEthereumChainParameter } from '../../types/interfaces'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any
  }
}

describe('BrowserWeb3Connector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.ethereum = {
      isMetaMask: true,
      network: 1,
      on: jest.fn(),
      removeListener: jest.fn(),
      send: jest.fn(),
      sendAsync: jest.fn(),
      request: jest.fn()
    }
  })
  it('should activate a BrowserWeb3Connector with an account', async () => {
    jest
      .spyOn(ethers.providers.Web3Provider.prototype, 'getNetwork')
      .mockImplementation(async () => ({ name: '', chainId: 1 }))
    const spySubs = jest.spyOn(
      BrowserWeb3Connector.prototype,
      'subscribeToEvents'
    )
    const spyRequestAccount = jest
      .spyOn(BrowserWeb3Connector.prototype, 'requestAccount')
      .mockImplementationOnce(async () => {})

    const browserProvider = new BrowserWeb3Connector()
    const spyDetectLegacyChain = jest
      .spyOn(browserProvider, 'detectLegacyChain')
      .mockImplementationOnce(async () => {})
    await browserProvider.activate()
    expect(browserProvider.chainId).toBe(1)
    expect(browserProvider.provider).toBeInstanceOf(
      ethers.providers.Web3Provider
    )
    expect(spySubs).toHaveBeenCalled()
    expect(spyRequestAccount).toHaveBeenCalled()
    expect(spyDetectLegacyChain).toHaveBeenCalled()
  })

  it('should activate BrowserWeb3Connector without an account', async () => {
    jest
      .spyOn(ethers.providers.Web3Provider.prototype, 'getNetwork')
      .mockImplementation(async () => ({ name: '', chainId: 1 }))
    const spySubs = jest.spyOn(
      BrowserWeb3Connector.prototype,
      'subscribeToEvents'
    )
    const spyRequestAccount = jest.spyOn(
      BrowserWeb3Connector.prototype,
      'requestAccount'
    )
    const browserProvider = new BrowserWeb3Connector(false)
    const spyDetectLegacyChain = jest
      .spyOn(browserProvider, 'detectLegacyChain')
      .mockImplementationOnce(async () => {})
    await browserProvider.activate()
    expect(browserProvider.chainId).toBe(1)
    expect(browserProvider.account).toBeUndefined()
    expect(browserProvider.provider).toBeInstanceOf(
      ethers.providers.Web3Provider
    )
    expect(spySubs).toHaveBeenCalled()
    expect(spyRequestAccount).not.toHaveBeenCalled()
    expect(spyDetectLegacyChain).toHaveBeenCalled()
  })

  it('should throw an error when requestAccount to BrowserWeb3Connector without provider', async () => {
    const browserProvider = new BrowserWeb3Connector()
    expect(browserProvider.requestAccount()).rejects.toThrow(errors.NO_PROVIDER)
  })

  it('should throw an error when requestAccount to BrowserWeb3Connector with provider not instance of Web3Provider', async () => {
    const browserProvider = new BrowserWeb3Connector()
    // added type for TS but the object is not instance of Web3Provider
    browserProvider['_provider'] = {} as ethers.providers.Web3Provider
    expect(browserProvider.requestAccount()).rejects.toThrow(errors.NO_PROVIDER)
  })

  it('should throw an error when requestAccount to BrowserWeb3Connector with no account (empty)', async () => {
    jest
      .spyOn(ethers.providers.Web3Provider.prototype, 'send')
      .mockResolvedValue([])

    const browserProvider = new BrowserWeb3Connector()
    browserProvider['_provider'] = Object.create(
      ethers.providers.Web3Provider.prototype
    )

    expect(browserProvider.requestAccount()).rejects.toThrow(
      errors.NO_ACCOUNT(new Error('No accounts recovered.'))
    )
  })

  it('should throw an error when requestAccount to BrowserWeb3Connector with no account raise exception', async () => {
    const err = new Error('Some error')
    jest
      .spyOn(ethers.providers.Web3Provider.prototype, 'send')
      .mockImplementationOnce(() => {
        throw err
      })

    const browserProvider = new BrowserWeb3Connector()
    browserProvider['_provider'] = Object.create(
      ethers.providers.Web3Provider.prototype
    )
    expect(browserProvider.requestAccount()).rejects.toThrow(
      errors.NO_ACCOUNT(err)
    )
  })

  it('should set an account when requestAccount is called to BrowserWeb3Connector', async () => {
    const address =
      '0x5dB7c73A809499A06D4F849d611FC77bDB3D236b'.toLocaleLowerCase()
    jest
      .spyOn(ethers.providers.Web3Provider.prototype, 'send')
      .mockResolvedValue([address])
    const mockGetSigner = jest
      .fn()
      .mockImplementation(async () => ({} as ethers.Signer))

    const browserProvider = new BrowserWeb3Connector()
    browserProvider['_provider'] = Object.create(
      ethers.providers.Web3Provider.prototype
    ) as ethers.providers.Web3Provider
    browserProvider['_provider']['getSigner'] = mockGetSigner
    expect(browserProvider.account).toBeUndefined()
    await browserProvider.requestAccount()
    expect(browserProvider.account).not.toBeUndefined()
    expect(mockGetSigner).toHaveBeenCalledWith(address)
  })

  it('should throw an error when activate a BrowserWeb3Connector without window.ethereum', async () => {
    window.ethereum = undefined
    const browserProvider = new BrowserWeb3Connector()
    expect(browserProvider.activate()).rejects.toThrow(errors.NO_ETHEREUM)
  })

  it('should emit an event when calling handleAccountChanged', async () => {
    const accounts = ['0x5dB7c73A809499A06D4F849d611FC77bDB3D236b']
    const account = Object.create(ethers.providers.JsonRpcSigner.prototype)
    jest
      .spyOn(ethers.providers.Web3Provider.prototype, 'getSigner')
      .mockReturnValue(account)
    const browserProvider = new BrowserWeb3Connector()
    browserProvider['_isActive'] = true
    browserProvider['_provider'] = Object.create(
      ethers.providers.Web3Provider.prototype
    ) as ethers.providers.Web3Provider
    const mockEmitEvent = jest.fn()
    browserProvider['_provider']['emit'] = mockEmitEvent
    browserProvider['handleAccountChanged'](accounts)
    expect(browserProvider.account).toBe(account)
    expect(mockEmitEvent).toHaveBeenCalledWith(
      ProviderEvents.ACCOUNT_CHANGED,
      browserProvider['_account']
    )
  })

  it('should emit an event when calling handleAccountChanged without accounts', async () => {
    const accounts: string[] = []
    const account = Object.create(ethers.providers.JsonRpcSigner.prototype)
    jest
      .spyOn(ethers.providers.Web3Provider.prototype, 'getSigner')
      .mockReturnValue(account)
    const browserProvider = new BrowserWeb3Connector()
    browserProvider['_isActive'] = true
    browserProvider['_provider'] = Object.create(
      ethers.providers.Web3Provider.prototype
    ) as ethers.providers.Web3Provider
    const mockEmitEvent = jest.fn()
    browserProvider['_provider']['emit'] = mockEmitEvent
    browserProvider['handleAccountChanged'](accounts)
    expect(mockEmitEvent).toHaveBeenCalledWith(
      ProviderEvents.ACCOUNT_CHANGED,
      browserProvider['_account']
    )
    expect(browserProvider['_account']).toBe(undefined)
  })

  it('should throw an error when calling handleAccountChanged without provider', () => {
    const accounts = ['0x5dB7c73A809499A06D4F849d611FC77bDB3D236b']
    const account = Object.create(ethers.providers.JsonRpcSigner.prototype)
    jest
      .spyOn(ethers.providers.Web3Provider.prototype, 'getSigner')
      .mockReturnValue(account)
    const browserProvider = new BrowserWeb3Connector()
    browserProvider['_isActive'] = true
    browserProvider['_provider'] = undefined
    expect(() => browserProvider['handleAccountChanged'](accounts)).toThrow(
      errors.NO_PROVIDER
    )
  })

  it('should throw an error when calling handleAccountChanged with a provider not instance of Web3Provider', () => {
    const accounts = ['0x5dB7c73A809499A06D4F849d611FC77bDB3D236b']
    const account = Object.create(ethers.providers.JsonRpcSigner.prototype)
    jest
      .spyOn(ethers.providers.Web3Provider.prototype, 'getSigner')
      .mockReturnValue(account)
    const browserProvider = new BrowserWeb3Connector()
    browserProvider['_isActive'] = true
    browserProvider['_provider'] = Object.create(
      ethers.providers.JsonRpcProvider.prototype
    ) as ethers.providers.JsonRpcProvider
    const mockEmitEvent = jest.fn()
    browserProvider['_provider']['emit'] = mockEmitEvent
    expect(() => browserProvider['handleAccountChanged'](accounts)).toThrow(
      errors.NO_PROVIDER
    )
    expect(mockEmitEvent).not.toHaveBeenCalled()
  })

  it('should update chainId, isLegacy and emit an event when calling handleChainChanged', async () => {
    const chainId = '1'
    const browserProvider = new BrowserWeb3Connector()
    browserProvider['_isActive'] = true
    browserProvider['_chainId'] = 123
    browserProvider['_provider'] = Object.create(
      ethers.providers.Web3Provider.prototype
    ) as ethers.providers.Web3Provider
    const mockEmitEvent = jest.fn()
    browserProvider['_provider']['emit'] = mockEmitEvent
    browserProvider['_isLegacy'] = false
    const spyDetectLegacyChain = jest
      .spyOn(browserProvider, 'detectLegacyChain')
      .mockImplementationOnce(async () => {})
    await browserProvider['handleChainChanged'](chainId)
    expect(mockEmitEvent).toHaveBeenCalledWith(ProviderEvents.CHAIN_CHANGED, 1)
    expect(browserProvider.chainId).toEqual(1)
    expect(spyDetectLegacyChain).toHaveBeenCalled()
  })

  it('should emit an event when calling handleConnect', async () => {
    const connectInfo = {
      chainId: '1'
    }
    const browserProvider = new BrowserWeb3Connector()
    browserProvider['_isActive'] = true
    browserProvider['_provider'] = Object.create(
      ethers.providers.JsonRpcProvider.prototype
    ) as ethers.providers.JsonRpcProvider
    const mockEmitEvent = jest.fn()
    browserProvider['_provider']['emit'] = mockEmitEvent
    browserProvider['handleConnect'](connectInfo)
    expect(mockEmitEvent).toHaveBeenCalledWith(
      ProviderEvents.CONNECT,
      connectInfo
    )
  })

  it('should emit an event when calling handleDisconnect', async () => {
    const providerRpcError = {
      name: 'Provider Error',
      message: 'Provider Error Message',
      code: -32000
    }
    const browserProvider = new BrowserWeb3Connector()
    browserProvider['_isActive'] = true
    browserProvider['_provider'] = Object.create(
      ethers.providers.JsonRpcProvider.prototype
    ) as ethers.providers.JsonRpcProvider
    const mockEmitEvent = jest.fn()
    browserProvider['_provider']['emit'] = mockEmitEvent
    browserProvider['handleDisconnect'](providerRpcError)
    expect(mockEmitEvent).toHaveBeenCalledWith(
      ProviderEvents.DISCONNECT,
      providerRpcError
    )
  })

  it('Should sign a message', async () => {
    // This method belongs to abstract class, so is the same for both subclases, so we only test it
    // in one of them (this one).
    const spySigner = jest.spyOn(Wallet.prototype, 'signMessage')
    jest
      .spyOn(BrowserWeb3Connector.prototype, 'isReadOnly', 'get')
      .mockReturnValueOnce(false)
    const provider = new BrowserWeb3Connector()
    provider['_isActive'] = true
    // fake pk from ganache
    provider['_account'] = new Wallet(
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    const signedMsg = await provider.signMessage('msg')
    expect(spySigner).toHaveBeenCalledWith('msg')
    expect(typeof signedMsg).toBe('string')
  })

  it('should throw an error when connector is not activated', async () => {
    // This method belongs to abstract class, so is the same for both subclases, so we only test it
    // in one of them (this one).
    const spySigner = jest.spyOn(Wallet.prototype, 'signMessage')
    const provider = new BrowserWeb3Connector()
    expect(provider.signMessage('msg')).rejects.toThrow(errors.MUST_ACTIVATE)
    expect(spySigner).not.toHaveBeenCalled()
  })

  it('should throw an error when account is not set (does not have an account)', async () => {
    // This method belongs to abstract class, so is the same for both subclases, so we only test it
    // in one of them (this one).
    const spySigner = jest.spyOn(Wallet.prototype, 'signMessage')
    const provider = new BrowserWeb3Connector()
    jest
      .spyOn(BrowserWeb3Connector.prototype, 'isReadOnly', 'get')
      .mockReturnValueOnce(true)
    provider['_isActive'] = true
    await expect(provider.signMessage('msg')).rejects.toThrow(
      errors.READ_ONLY('signMessage')
    )
    expect(spySigner).not.toHaveBeenCalled()
  })

  it('should unsubscribe from events and call upper class deactivate when deactivate is called', () => {
    const spyUnsub = jest.spyOn(
      BrowserWeb3Connector.prototype,
      'unsubscribeFromEvents'
    )
    const spyDeactivate = jest.spyOn(
      AbstractWeb3Connector.prototype,
      'deactivate'
    )
    const provider = new BrowserWeb3Connector()
    provider.deactivate()
    expect(spyUnsub).toHaveBeenCalledWith(window.ethereum)
    expect(spyDeactivate).toHaveBeenCalled()
  })

  it('should throw an error when deactivate is called and no window.ethereum found', () => {
    const spyUnsub = jest.spyOn(
      BrowserWeb3Connector.prototype,
      'unsubscribeFromEvents'
    )
    const spyDeactivate = jest.spyOn(
      AbstractWeb3Connector.prototype,
      'deactivate'
    )
    window.ethereum = undefined
    const provider = new BrowserWeb3Connector()
    expect(provider.deactivate()).rejects.toThrow(errors.NO_ETHEREUM)
    expect(spyUnsub).not.toHaveBeenCalled()
    expect(spyDeactivate).not.toHaveBeenCalled()
  })

  it('should resolve if switchChain was successful', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(null)
    const provider = new BrowserWeb3Connector()
    provider['_provider'] = Object.create(
      ethers.providers.Web3Provider.prototype
    ) as ethers.providers.Web3Provider
    provider['_provider']['send'] = mockSend
    expect(await provider.switchChain(1)).toBeUndefined()
    expect(mockSend).toHaveBeenCalledWith('wallet_switchEthereumChain', [
      { chainId: '0x1' }
    ])
  })

  it('should throw an error if switchChain is called and no provider found', () => {
    const provider = new BrowserWeb3Connector()
    expect(provider.switchChain(1)).rejects.toThrow(errors.NO_PROVIDER)
  })

  it('should return if trying to change to the current chain', async () => {
    const mockSend = jest.fn()
    const provider = new BrowserWeb3Connector()
    provider['_chainId'] = 1
    provider['_provider'] = Object.create(
      ethers.providers.Web3Provider.prototype
    ) as ethers.providers.Web3Provider
    provider['_provider']['send'] = mockSend
    expect(await provider.switchChain(1)).toBeUndefined()
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('should propagate the error if request fails', async () => {
    const error = new Error('error')
    const provider = new BrowserWeb3Connector()
    const mockSend = jest.fn().mockImplementationOnce(() => {
      throw error
    })
    provider['_provider'] = Object.create(
      ethers.providers.Web3Provider.prototype
    ) as ethers.providers.Web3Provider
    provider['_provider']['send'] = mockSend

    expect(provider.switchChain(1)).rejects.toThrow(error)
    expect(mockSend).toHaveBeenCalledWith('wallet_switchEthereumChain', [
      { chainId: '0x1' }
    ])
  })

  it('should resolve if addChain was successful', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(null)
    const provider = new BrowserWeb3Connector()
    provider['_provider'] = Object.create(
      ethers.providers.Web3Provider.prototype
    ) as ethers.providers.Web3Provider
    provider['_provider']['send'] = mockSend
    expect(
      await provider.addChain(
        1,
        'chainName',
        ['rpcUrl', 'rpcUrl2'],
        'currencyName',
        'currencySymbol',
        'blockExplorerUrl'
      )
    ).toBeUndefined()
    expect(mockSend).toHaveBeenCalledWith('wallet_addEthereumChain', [
      {
        chainId: '0x1',
        chainName: 'chainName',
        rpcUrls: ['rpcUrl', 'rpcUrl2'],
        nativeCurrency: {
          name: 'currencyName',
          symbol: 'currencySymbol',
          decimals: 18
        },
        blockExplorerUrls: ['blockExplorerUrl']
      } as AddEthereumChainParameter
    ])
  })

  it('should resolve if addChain was successful with alternative params', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(null)
    const provider = new BrowserWeb3Connector()
    provider['_provider'] = Object.create(
      ethers.providers.Web3Provider.prototype
    ) as ethers.providers.Web3Provider
    provider['_provider']['send'] = mockSend
    expect(
      await provider.addChain(
        1,
        'chainName',
        ['rpcUrl', 'rpcUrl2'],
        'currencyName',
        'currencySymbol'
      )
    ).toBeUndefined()
    expect(mockSend).toHaveBeenCalledWith('wallet_addEthereumChain', [
      {
        chainId: '0x1',
        chainName: 'chainName',
        rpcUrls: ['rpcUrl', 'rpcUrl2'],
        nativeCurrency: {
          name: 'currencyName',
          symbol: 'currencySymbol',
          decimals: 18
        }
      } as AddEthereumChainParameter
    ])
  })

  it('should resolve if addChain was successful with alternative params', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(null)
    const provider = new BrowserWeb3Connector()
    provider['_provider'] = Object.create(
      ethers.providers.Web3Provider.prototype
    ) as ethers.providers.Web3Provider
    provider['_provider']['send'] = mockSend
    expect(
      await provider.addChain(
        1,
        'chainName',
        'rpcUrl',
        'currencyName',
        'currencySymbol',
        ['blockExplorerUrl', 'blockExplorerUrl2']
      )
    ).toBeUndefined()
    expect(mockSend).toHaveBeenCalledWith('wallet_addEthereumChain', [
      {
        chainId: '0x1',
        chainName: 'chainName',
        rpcUrls: ['rpcUrl'],
        nativeCurrency: {
          name: 'currencyName',
          symbol: 'currencySymbol',
          decimals: 18
        },
        blockExplorerUrls: ['blockExplorerUrl', 'blockExplorerUrl2']
      } as AddEthereumChainParameter
    ])
  })

  it('should throw an error if addChain is called and no provider found', () => {
    const provider = new BrowserWeb3Connector()
    expect(
      provider.addChain(
        1,
        'chainName',
        'rpcUrl',
        'currencyName',
        'currencySymbol'
      )
    ).rejects.toThrow(errors.NO_PROVIDER)
  })

  it('should propagate the error if request fails', async () => {
    const error = new Error('error')
    const provider = new BrowserWeb3Connector()
    const mockSend = jest.fn().mockImplementationOnce(() => {
      throw error
    })
    provider['_provider'] = Object.create(
      ethers.providers.Web3Provider.prototype
    ) as ethers.providers.Web3Provider
    provider['_provider']['send'] = mockSend

    expect(
      provider.addChain(
        1,
        'chainName',
        'rpcUrl',
        'currencyName',
        'currencySymbol'
      )
    ).rejects.toThrow(error)
    expect(mockSend).toHaveBeenCalledWith('wallet_addEthereumChain', [
      {
        chainId: '0x1',
        chainName: 'chainName',
        rpcUrls: ['rpcUrl'],
        nativeCurrency: {
          name: 'currencyName',
          symbol: 'currencySymbol',
          decimals: 18
        }
      } as AddEthereumChainParameter
    ])
  })

  it('should return true if account not set when calling isReadOnly method', async () => {
    const connector = new BrowserWeb3Connector()
    expect(connector.isReadOnly).toBe(true)
  })

  it('should return false if account not set when calling isReadOnly method', async () => {
    const connector = new BrowserWeb3Connector()
    connector['_account'] = {} as Wallet
    expect(connector.isReadOnly).toBe(false)
  })
})
