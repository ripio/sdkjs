import ModalConnector from '../ModalConnector'
import {
  configureChains,
  createClient,
  goerli,
  mainnet,
  getNetwork,
  getProvider,
  disconnect,
  switchNetwork,
  getAccount,
  fetchSigner,
  watchAccount,
  watchNetwork,
  watchProvider,
  GetAccountResult,
  GetNetworkResult,
  GetProviderResult,
  Client
} from '@wagmi/core'
import { AbstractWeb3Connector } from '@ripio/sdk/connectors'
import { Web3Modal } from '@web3modal/html'
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider
} from '@web3modal/ethereum'
import { ethers } from 'ethers'
import {
  __resetCoreMocks,
  __setAccountConnected,
  __setClient,
  __setFetchSigner,
  __setProvider
} from '../__mocks__/@wagmi/core'
import { errors } from '@ripio/sdk/types'
import {
  __setEthereumClient,
  __setModalConnectors,
  __setWalletConnectProvider
} from '../__mocks__/@web3modal/ethereum'
import { __resetHtmlMocks, __setWeb3Modal } from '../__mocks__/@web3modal/html'

describe('ModalConnector constructor', () => {
  beforeEach(() => {
    __resetHtmlMocks()
  })
  it('should set requestAccount to true by default', () => {
    const modalConnector = new ModalConnector('projectId', mainnet)
    expect(modalConnector['_requestAccount']).toBe(true)
  })

  it.each([{ value: true }, { value: false }])(
    'should set requestAccount to the provided value: $value',
    ({ value }) => {
      const modalConnector = new ModalConnector('projectId', mainnet, value)
      expect(modalConnector['_requestAccount']).toBe(value)
    }
  )

  it('should configure chains with mainnet by default', () => {
    const walletConnectProviderMock = jest.fn()
    __setWalletConnectProvider(walletConnectProviderMock)
    new ModalConnector('projectId')
    expect(configureChains).toHaveBeenCalledWith(
      [mainnet],
      [walletConnectProviderMock]
    )
  })

  it('should configure chains with provided chains', () => {
    const walletConnectProviderMock = jest.fn()
    __setWalletConnectProvider(walletConnectProviderMock)
    const chains = [goerli]
    new ModalConnector('projectId', chains)
    expect(configureChains).toHaveBeenCalledWith(chains, [
      walletConnectProviderMock
    ])
  })

  it('should create a Web3Modal instance with the correct arguments', () => {
    const web3ModalMock = {}
    __setWeb3Modal(web3ModalMock)
    const clientMock = {} as unknown as Client
    __setClient(clientMock)
    const providerMock = jest.fn()
    __setProvider(providerMock)
    const ethereumClientMock = jest.fn() as unknown as typeof EthereumClient
    __setEthereumClient(ethereumClientMock)
    const modalConnectorsMock = jest.fn()
    __setModalConnectors(modalConnectorsMock)
    const modalConnector = new ModalConnector('projectId')
    expect(Web3Modal).toHaveBeenCalledWith(
      { projectId: 'projectId' },
      ethereumClientMock
    )
    expect(EthereumClient).toHaveBeenCalledWith(clientMock, [mainnet])
    expect(modalConnectors).toHaveBeenCalledWith({
      projectId: 'projectId',
      version: '1',
      appName: 'web3Modal',
      chains: [mainnet]
    })
    expect(createClient).toHaveBeenCalledWith({
      autoConnect: true,
      connectors: modalConnectorsMock,
      provider: providerMock
    })
    expect(walletConnectProvider).toHaveBeenCalledWith({
      projectId: 'projectId'
    })
    expect(modalConnector.web3Modal).toBe(web3ModalMock)
  })

  it('should extend AbstractWeb3Connector', () => {
    const modalConnector = new ModalConnector('projectId')
    expect(modalConnector).toBeInstanceOf(AbstractWeb3Connector)
  })
})

describe('ModalConnector methods', () => {
  const projectId = 'your-project-id'

  let modalConnector: ModalConnector

  beforeEach(() => {
    __resetCoreMocks()
    modalConnector = new ModalConnector(projectId)
  })

  describe('activate()', () => {
    it('should activate the connector and return provider, chainId and account', async () => {
      const spySubscribeToEvents = jest
        .spyOn(ModalConnector.prototype, 'subscribeToEvents')
        .mockImplementationOnce(() => jest.fn())
      const spyDetectLegacyChain = jest
        .spyOn(modalConnector, 'detectLegacyChain')
        .mockImplementationOnce(async () => {})
      const spyRequestAccount = jest
        .spyOn(ModalConnector.prototype, 'requestAccount')
        .mockImplementationOnce(async () => {
          modalConnector['_account'] =
            {} as unknown as ethers.providers.JsonRpcSigner
        })
      const result = await modalConnector.activate()
      expect(result.provider).toBeDefined()
      expect(result.chainId).toBeDefined()
      expect(result.account).toBeDefined()
      expect(spySubscribeToEvents).toHaveBeenCalled()
      expect(spyDetectLegacyChain).toHaveBeenCalled()
      expect(spyRequestAccount).toHaveBeenCalled()
      expect(getNetwork).toHaveBeenCalled()
      expect(getProvider).toHaveBeenCalled()
    })
  })

  describe('deactivate()', () => {
    it('should deactivate the connector and disconnect from provider', async () => {
      const spy = jest.spyOn(modalConnector, 'unsubscribeFromEvents')
      await modalConnector.deactivate()
      expect(modalConnector.isActive).toBe(false)
      expect(spy).toHaveBeenCalled()
      expect(disconnect).toHaveBeenCalled()
    })
  })

  describe('switchChain(chainId)', () => {
    it('should throw an error if switchChain is called and no provider found', () => {
      expect(modalConnector.switchChain(1)).rejects.toThrow(errors.NO_PROVIDER)
    })
    it('should throw an error when requestAccount with provider not instance of StaticJsonRpcProvider', async () => {
      // added type for TS but the object is not instance of StaticJsonRpcProvider
      modalConnector['_provider'] = {} as ethers.providers.StaticJsonRpcProvider
      expect(modalConnector.requestAccount()).rejects.toThrow(
        errors.NO_PROVIDER
      )
    })
    it.each([
      { chain: 4, switchNetworkCalls: 1 },
      { chain: 1, switchNetworkCalls: 0 }
    ])(
      'should call switchNetwork if the chain param is different from the current chain',
      async ({ chain, switchNetworkCalls }) => {
        modalConnector['_provider'] = Object.create(
          ethers.providers.StaticJsonRpcProvider.prototype
        ) as ethers.providers.StaticJsonRpcProvider
        modalConnector['_chainId'] = 1
        await modalConnector.switchChain(chain)
        expect(switchNetwork).toHaveBeenCalledTimes(switchNetworkCalls)
      }
    )
  })

  describe('requestAccount()', () => {
    it('should throw an error when requestAccount without provider', async () => {
      expect(modalConnector.requestAccount()).rejects.toThrow(
        errors.NO_PROVIDER
      )
    })
    it('should throw an error when requestAccount with provider not instance of StaticJsonRpcProvider', async () => {
      // added type for TS but the object is not instance of StaticJsonRpcProvider
      modalConnector['_provider'] = {} as ethers.providers.StaticJsonRpcProvider
      expect(modalConnector.requestAccount()).rejects.toThrow(
        errors.NO_PROVIDER
      )
    })
    it('should throw an error when requestAccount with no account', async () => {
      const err = new Error('Some error')
      __setFetchSigner(err)
      __setAccountConnected(true)
      modalConnector['_provider'] = Object.create(
        ethers.providers.StaticJsonRpcProvider.prototype
      ) as ethers.providers.StaticJsonRpcProvider
      await expect(modalConnector.requestAccount()).rejects.toThrow(
        errors.NO_ACCOUNT(err)
      )
    })
    it('should open the web3 modal if user is not connected', async () => {
      modalConnector['_provider'] = Object.create(
        ethers.providers.StaticJsonRpcProvider.prototype
      ) as ethers.providers.StaticJsonRpcProvider
      await modalConnector.requestAccount()
      expect(getAccount).toHaveBeenCalled()
      expect(modalConnector.web3Modal.openModal).toHaveBeenCalled()
      expect(fetchSigner).not.toHaveBeenCalled()
    })

    it('should fetch the signer if user is already connected', async () => {
      modalConnector['_provider'] = Object.create(
        ethers.providers.StaticJsonRpcProvider.prototype
      ) as ethers.providers.StaticJsonRpcProvider
      __setAccountConnected(true)
      await modalConnector.requestAccount()
      expect(getAccount).toHaveBeenCalled()
      expect(modalConnector.web3Modal.openModal).not.toHaveBeenCalled()
      expect(fetchSigner).toHaveBeenCalled()
    })
  })

  describe('subscribeToEvents()', () => {
    it('should call watchAccount, watchNetwork and watchProvider with correct parameters', () => {
      const expectedEvents = [
        { fn: modalConnector['handleAccountChanged'], args: [] },
        { fn: modalConnector['handleChainChanged'], args: [] },
        {
          fn: modalConnector['handleProviderChanged'],
          args: [{}]
        }
      ]
      modalConnector.subscribeToEvents()
      expect(watchAccount).toHaveBeenCalledWith(
        ...expectedEvents[0].args,
        expectedEvents[0].fn
      )
      expect(watchNetwork).toHaveBeenCalledWith(
        ...expectedEvents[1].args,
        expectedEvents[1].fn
      )
      expect(watchProvider).toHaveBeenCalledWith(
        ...expectedEvents[2].args,
        expectedEvents[2].fn
      )
      expect(modalConnector['_events']).toHaveLength(3)
    })
  })

  describe('unsubscribeFromEvents()', () => {
    it('should unsubscribe from all events', () => {
      const event1 = jest.fn()
      const event2 = jest.fn()
      modalConnector['_events'] = [event1, event2]
      modalConnector.unsubscribeFromEvents()
      expect(event1).toHaveBeenCalled()
      expect(event2).toHaveBeenCalled()
      expect(modalConnector['_events']).toHaveLength(0)
    })
  })

  describe('handleAccountChanged', () => {
    it('should set the _account property to the new signer if the account is connected', async () => {
      // Call the handleAccountChanged method with an account that is connected
      await modalConnector['handleAccountChanged']({
        isConnected: true
      } as GetAccountResult)

      // Assert that fetchSigner was called once
      expect(fetchSigner).toHaveBeenCalledTimes(1)

      // Assert that the _account property was set to the returned signer object
      expect(modalConnector.account).toEqual(
        {} as ethers.providers.JsonRpcSigner
      )
    })

    it('should set the _account property to undefined if the account is not connected', async () => {
      // Call the handleAccountChanged method with an account that is not connected
      await modalConnector['handleAccountChanged']({
        isConnected: false
      } as GetAccountResult)

      // Assert that the _account property was set to undefined
      expect(modalConnector.account).toBeUndefined()
    })
  })

  describe('handleChainChanged', () => {
    it('should set the _chainId property to the new chain ID if the network object contains a chain', async () => {
      const spyDetectLegacyChain = jest
        .spyOn(modalConnector, 'detectLegacyChain')
        .mockImplementationOnce(async () => {})

      // Call the handleChainChanged method with a network object that contains a chain
      await modalConnector['handleChainChanged']({
        chain: { id: 1 }
      } as GetNetworkResult)

      // Assert that the _chainId property was set to 1
      expect(modalConnector.chainId).toEqual(1)

      // Assert that detectLegacyChain was called
      expect(spyDetectLegacyChain).toHaveBeenCalled()
    })

    it('should set the _chainId property to undefined if the network object does not contain a chain', async () => {
      const spyDetectLegacyChain = jest
        .spyOn(modalConnector, 'detectLegacyChain')
        .mockImplementationOnce(async () => {})

      // Call the handleChainChanged method with a network object that does not contain a chain
      await modalConnector['handleChainChanged']({} as GetNetworkResult)

      // Assert that the _chainId property was set to undefined
      expect(modalConnector.chainId).toBeUndefined()

      // Assert that detectLegacyChain was called
      expect(spyDetectLegacyChain).toHaveBeenCalled()
    })
  })

  describe('handleProviderChanged', () => {
    it('should set the _provider property to the new provider object', async () => {
      // Mock the provider object
      const provider = {} as GetProviderResult

      // Call the handleProviderChanged method with the provider object
      await modalConnector['handleProviderChanged'](provider)

      // Assert that the _provider property was set to the provider object
      expect(modalConnector.provider).toBe(provider)
    })
  })
})
