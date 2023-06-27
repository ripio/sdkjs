import { errors } from '@ripio/sdk'
import { providers } from 'ethers'
import ETHProvider, { EthereumProvider } from '@walletconnect/ethereum-provider'
import ModalConnector from '../ModalConnector'

jest.mock('ethers', () => ({
  providers: {
    Web3Provider: jest.fn()
  }
}))
jest.mock('@walletconnect/ethereum-provider')

describe('ModalConnector', () => {
  let modalConnector: ModalConnector
  const mockProvider = {
    getNetwork: jest.fn(),
    getSigner: jest.fn()
  }
  const mockWalletConnectProvider = {
    enable: jest.fn(),
    disconnect: jest.fn()
  };
  const options = {
    projectId: 'testProject',
    chains: [1],
    requestAccount: true
  }

  beforeEach(() => {
    (EthereumProvider.init as unknown as jest.Mock).mockResolvedValue(mockWalletConnectProvider);
    (providers.Web3Provider as unknown as jest.Mock).mockImplementation(() => mockProvider);
    modalConnector = new ModalConnector(options);
  })

  it('should construct a new instance', () => {
    expect(modalConnector).toBeInstanceOf(ModalConnector);
    expect(modalConnector).toHaveProperty('activate')
    expect(modalConnector).toHaveProperty('deactivate')
    expect(modalConnector).toHaveProperty('requestAccount')
    expect(modalConnector).toHaveProperty('walletConnectProvider')
  })

  it('should activate the connection to the wallet', async () => {

    jest.spyOn(modalConnector, 'subscribeToEvents')
    jest.spyOn(modalConnector, 'requestAccount')

    const expectedOutput = {
      provider: mockProvider,
      chainId: 1,
      account: undefined
    }

    mockWalletConnectProvider.enable.mockResolvedValueOnce(['0x1234'])
    mockProvider.getNetwork.mockResolvedValue({ chainId: 1 })

    const result = await modalConnector.activate()

    expect(result).toEqual(expectedOutput)
    expect(EthereumProvider.init).toHaveBeenCalledWith({
      projectId: options.projectId,
      chains: options.chains,
      showQrModal: true
    })
    expect(mockProvider.getNetwork).toHaveBeenCalledTimes(1)
    expect(modalConnector.subscribeToEvents).toHaveBeenCalledWith(mockWalletConnectProvider)
    expect(modalConnector.requestAccount).toBeCalledTimes(1)
    expect(modalConnector.provider).toBe(expectedOutput.provider)
    expect(modalConnector.chainId).toBe(expectedOutput.chainId)
    expect(modalConnector.walletConnectProvider).toBe(mockWalletConnectProvider)
    expect(modalConnector.isActive).toBeTruthy()

  })

  it('by default, if requestAccount is not passed, activate method should call requestAccount.', async () => {

    const connector = new ModalConnector({ ...options, requestAccount: undefined });

    jest.spyOn(connector, 'subscribeToEvents')
    jest.spyOn(connector, 'requestAccount')

    const expectedOutput = {
      provider: mockProvider,
      chainId: 1,
      account: undefined
    }

    mockWalletConnectProvider.enable.mockResolvedValueOnce(['0x1234'])
    mockProvider.getNetwork.mockResolvedValue({ chainId: 1 })

    const result = await connector.activate()

    expect(result).toEqual(expectedOutput)
    expect(EthereumProvider.init).toHaveBeenCalledWith({
      projectId: options.projectId,
      chains: options.chains,
      showQrModal: true
    })
    expect(mockProvider.getNetwork).toHaveBeenCalledTimes(1)
    expect(connector.subscribeToEvents).toHaveBeenCalledWith(mockWalletConnectProvider)
    expect(connector.requestAccount).toBeCalledTimes(1)
    expect(connector.provider).toBe(expectedOutput.provider)
    expect(connector.chainId).toBe(expectedOutput.chainId)
    expect(connector.walletConnectProvider).toBe(mockWalletConnectProvider)
    expect(connector.isActive).toBeTruthy()
  })

  it('should not call requestAccount if _requestAccount is false', async () => {
    const connector = new ModalConnector({ ...options, requestAccount: false });
    connector.requestAccount = jest.fn();

    await connector.activate();

    expect(connector.requestAccount).not.toHaveBeenCalled();
  });

  it('requestAccount should call to enable walletconnect provider', async () => {
    const expectedAccount = {
      address: '0x1234'
    }
    mockWalletConnectProvider.enable.mockResolvedValueOnce([expectedAccount.address]);
    mockProvider.getSigner.mockReturnValueOnce(expectedAccount);

    jest.spyOn(modalConnector, 'walletConnectProvider', 'get')
      .mockReturnValueOnce(mockWalletConnectProvider as unknown as ETHProvider)
      .mockReturnValueOnce(mockWalletConnectProvider as unknown as ETHProvider)

    jest.spyOn(modalConnector, 'provider', 'get')
      .mockReturnValueOnce(mockProvider as unknown as providers.Web3Provider)
      .mockReturnValueOnce(mockProvider as unknown as providers.Web3Provider)
      .mockReturnValueOnce(mockProvider as unknown as providers.Web3Provider)

    await modalConnector.requestAccount();

    expect(mockWalletConnectProvider.enable).toHaveBeenCalledTimes(1);
    expect(mockProvider.getSigner).toHaveBeenCalledWith(expectedAccount.address)
    expect(modalConnector.account).toBe(expectedAccount)
  })

  it('requestAccount should fail if no provider', async () => {

    jest.spyOn(modalConnector, 'provider', 'get')
      .mockReturnValueOnce(undefined)

    await expect(modalConnector.requestAccount()).rejects.toThrow(errors.NO_PROVIDER)
  })

  it('requestAccount should fail if no walletConnectProvider', async () => {

    jest.spyOn(modalConnector, 'provider', 'get')
      .mockReturnValueOnce(mockProvider as unknown as providers.Web3Provider)

    jest.spyOn(modalConnector, 'walletConnectProvider', 'get')
      .mockReturnValueOnce(undefined)

    await expect(modalConnector.requestAccount()).rejects.toThrow(errors.NO_PROVIDER)
  })

  it('requestAccount should throw no_account error if enable fails', async () => {
    const error = new Error('fake-error')
    mockWalletConnectProvider.enable.mockRejectedValueOnce(error);

    jest.spyOn(modalConnector, 'walletConnectProvider', 'get')
      .mockReturnValueOnce(mockWalletConnectProvider as unknown as ETHProvider)
      .mockReturnValueOnce(mockWalletConnectProvider as unknown as ETHProvider)

    jest.spyOn(modalConnector, 'provider', 'get')
      .mockReturnValueOnce(mockProvider as unknown as providers.Web3Provider)

    await expect(modalConnector.requestAccount()).rejects.toThrow(errors.NO_ACCOUNT(error))

    expect(mockWalletConnectProvider.enable).toHaveBeenCalledTimes(1);
    expect(mockProvider.getSigner).not.toHaveBeenCalled()
    expect(modalConnector.account).toBeUndefined()
  })

  it('requestAccount should throw no_account error if accounts is empty', async () => {

    mockWalletConnectProvider.enable.mockResolvedValueOnce([]);

    jest.spyOn(modalConnector, 'walletConnectProvider', 'get')
      .mockReturnValueOnce(mockWalletConnectProvider as unknown as ETHProvider)
      .mockReturnValueOnce(mockWalletConnectProvider as unknown as ETHProvider)

    jest.spyOn(modalConnector, 'provider', 'get')
      .mockReturnValueOnce(mockProvider as unknown as providers.Web3Provider)

    await expect(modalConnector.requestAccount()).rejects.toThrow(errors.NO_ACCOUNT(new Error('No accounts recovered.')))

    expect(mockWalletConnectProvider.enable).toHaveBeenCalledTimes(1);
    expect(mockProvider.getSigner).not.toHaveBeenCalled()
    expect(modalConnector.account).toBeUndefined()
  })

  it('deactivate should call to deactivate from wallet connect', () => {

    jest.spyOn(modalConnector, 'provider', 'get')
      .mockReturnValueOnce(mockProvider as unknown as providers.Web3Provider)
      .mockReturnValueOnce(mockProvider as unknown as providers.Web3Provider)
    
    jest.spyOn(modalConnector, 'walletConnectProvider', 'get')
      .mockReturnValueOnce(mockWalletConnectProvider as unknown as ETHProvider)
      .mockReturnValueOnce(mockWalletConnectProvider as unknown as ETHProvider)
    
    jest.spyOn(modalConnector, 'unsubscribeFromEvents')
    
    modalConnector.deactivate();
    expect(modalConnector.unsubscribeFromEvents).toBeCalledWith(mockProvider)
    expect(mockWalletConnectProvider.disconnect).toHaveBeenCalledTimes(1);
  })

  it('deactivate should throw an error if there is no provider', async () => {

    jest.spyOn(modalConnector, 'provider', 'get')
      .mockReturnValueOnce(undefined)
    
    jest.spyOn(modalConnector, 'walletConnectProvider', 'get')
      .mockReturnValueOnce(mockWalletConnectProvider as unknown as ETHProvider)

    await expect(modalConnector.deactivate()).rejects.toThrow(errors.NO_ETHEREUM)
    
  })

  it('deactivate should throw an error if there is no walletConnectProvider', async () => {

    jest.spyOn(modalConnector, 'provider', 'get')
      .mockReturnValueOnce(mockProvider as unknown as providers.Web3Provider)
    
    jest.spyOn(modalConnector, 'walletConnectProvider', 'get')
      .mockReturnValueOnce(undefined)

    await expect(modalConnector.deactivate()).rejects.toThrow(errors.NO_ETHEREUM)
    
  })

})
