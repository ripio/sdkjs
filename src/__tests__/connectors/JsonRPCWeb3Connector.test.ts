import JsonRPCWeb3Connector from '../../connectors/JsonRPCWeb3Connector'
import AbstractWeb3Connector from '../../connectors/AbstractWeb3Connector'
import errors from '../../types/errors'
import { BigNumber, ethers, providers } from 'ethers'
import { TransactionResponse } from '../../types/interfaces'
import { toWei } from '../../utils/conversions'
import { connectorsUtils, validations } from '../../utils'
import {
  FunctionFragment,
  ParamType,
  TransactionDescription
} from 'ethers/lib/utils'
import { EIP2612PermitTypedDataSigner } from '../../utils/typed-data'

describe('JsonRPCWeb3Connector constructor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('Should create a new instance with a websocket provider', () => {
    const mockWS = {} as providers.WebSocketProvider
    jest
      .spyOn(providers, 'WebSocketProvider')
      .mockImplementationOnce(() => mockWS)

    const connector = new JsonRPCWeb3Connector('ws://localhost:8545')
    expect(connector).toBeInstanceOf(JsonRPCWeb3Connector)
    expect(connector['_provider']).toBe(mockWS)
  })

  it('Should create a new instance with a http provider', () => {
    const mockHttps = {} as providers.WebSocketProvider
    jest
      .spyOn(providers, 'JsonRpcProvider')
      .mockImplementationOnce(() => mockHttps)

    const connector = new JsonRPCWeb3Connector('https://localhost:8545')
    expect(connector).toBeInstanceOf(JsonRPCWeb3Connector)
    expect(connector['_provider']).toBe(mockHttps)
  })

  it('Should create a new instance without an account', async () => {
    jest
      .spyOn(ethers.providers.JsonRpcProvider.prototype, 'getNetwork')
      .mockResolvedValueOnce({ name: '', chainId: 1 })
    const instance = new JsonRPCWeb3Connector('http://fake')
    const spyDetectLegacyChain = jest
      .spyOn(instance, 'detectLegacyChain')
      .mockImplementationOnce(async () => {})
    await instance.activate()
    expect(instance).toBeInstanceOf(JsonRPCWeb3Connector)
    expect(instance.provider).not.toBeUndefined()
    expect(instance.chainId).toBe(1)
    expect(instance.account).toBeUndefined()
    expect(spyDetectLegacyChain).toHaveBeenCalled()
  })

  it('Should create a new instance with an account', async () => {
    jest
      .spyOn(ethers.providers.JsonRpcProvider.prototype, 'getNetwork')
      .mockResolvedValueOnce({ name: '', chainId: 1 })
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      '651e3c36052bdb537d46ca6036542e422f32ca5a30d8348a281707ffbe37ee91'
    )

    const spyDetectLegacyChain = jest
      .spyOn(instance, 'detectLegacyChain')
      .mockImplementationOnce(async () => {})
    await instance.activate()
    expect(instance).toBeInstanceOf(JsonRPCWeb3Connector)
    expect(instance.provider).not.toBeUndefined()
    expect(instance.chainId).toBe(1)
    expect(instance.account).not.toBeUndefined()
    expect(spyDetectLegacyChain).toHaveBeenCalled()
  })
})

describe('JsonRPCWeb3Connector activate method', () => {
  it('Should activate the provider without an account', async () => {
    jest
      .spyOn(ethers.providers.JsonRpcProvider.prototype, 'getNetwork')
      .mockResolvedValueOnce({ name: '', chainId: 1 })
    const instance = new JsonRPCWeb3Connector('http://fake')
    const spyDetectLegacyChain = jest
      .spyOn(instance, 'detectLegacyChain')
      .mockImplementationOnce(async () => {})
    const result = await instance.activate()
    expect(result).toStrictEqual({
      provider: instance.provider,
      chainId: instance.chainId,
      account: undefined
    })
    expect(spyDetectLegacyChain).toHaveBeenCalled()
  })

  it('Should activate the provider with an account', async () => {
    jest
      .spyOn(ethers.providers.JsonRpcProvider.prototype, 'getNetwork')
      .mockResolvedValueOnce({ name: '', chainId: 1 })
    jest
      .spyOn(ethers.providers.JsonRpcProvider.prototype, 'getFeeData')
      .mockResolvedValueOnce({
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        gasPrice: BigNumber.from('1')
      })
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      '651e3c36052bdb537d46ca6036542e422f32ca5a30d8348a281707ffbe37ee91'
    )
    const spyDetectLegacyChain = jest
      .spyOn(instance, 'detectLegacyChain')
      .mockImplementationOnce(async () => {})
    const result = await instance.activate()
    expect(result).toStrictEqual({
      provider: instance.provider,
      chainId: instance.chainId,
      account: instance.account
    })
    expect(spyDetectLegacyChain).toHaveBeenCalled()
  })

  it('Should throw an error if activating without provider or chainId', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      '651e3c36052bdb537d46ca6036542e422f32ca5a30d8348a281707ffbe37ee91'
    )
    instance['_provider'] = undefined
    expect(instance.activate()).rejects.toThrow(errors.PROVIDER_NOT_INITIALIZED)
  })
})

describe('JsonRPCWeb3Connector deactivate method', () => {
  it('Should deactivate the provider', async () => {
    jest
      .spyOn(ethers.providers.JsonRpcProvider.prototype, 'getNetwork')
      .mockResolvedValueOnce({ name: '', chainId: 1 })
    const spyAbstractWeb3ProviderDeactivate = jest.spyOn(
      AbstractWeb3Connector.prototype,
      'deactivate'
    )
    const instance = new JsonRPCWeb3Connector('http://fake')
    instance['_isActive'] = true
    instance['_chainId'] = 5
    await instance.deactivate()
    expect(spyAbstractWeb3ProviderDeactivate).toHaveBeenCalled()
  })

  it('Should deactivate the provider and close websocket connection when provider is a WebSocketProvider', async () => {
    const spyAbstractWeb3ProviderDeactivate = jest.spyOn(
      AbstractWeb3Connector.prototype,
      'deactivate'
    )
    const mockWS = Object.create(ethers.providers.WebSocketProvider.prototype)
    const mockDestroy = jest
      .spyOn(ethers.providers.WebSocketProvider.prototype, 'destroy')
      .mockResolvedValueOnce()
    mockWS.getNetwork = jest.fn(async () => ({ name: '', chainId: 1 }))
    mockWS.removeAllListeners = jest.fn()
    const instance = Object.create(JsonRPCWeb3Connector.prototype)
    instance['_provider'] = mockWS
    instance['_isActive'] = true
    instance['_chainId'] = 5
    await instance.deactivate()
    expect(spyAbstractWeb3ProviderDeactivate).toHaveBeenCalled()
    expect(mockWS.removeAllListeners).toHaveBeenCalled()
    expect(mockDestroy).toHaveBeenCalled()
  })
})

describe('AbstractWeb3Connector getTransactionFromHash method', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })
  // this method belongs to abstract class but since we can't test abstract classes, we tested in its child.
  it('Should call getTransaction from provider and return an object with tx data', async () => {
    const instance = new JsonRPCWeb3Connector('http://fake')
    instance['_isActive'] = true
    const mockGetTx = jest
      .spyOn(ethers.providers.JsonRpcProvider.prototype, 'getTransaction')
      .mockResolvedValueOnce({} as TransactionResponse)
    const tx = await instance.getTransaction('tx-hash')
    expect(mockGetTx).toHaveBeenCalledWith('tx-hash')
    expect(tx).toEqual({})
  })

  it('Should throw an error if provider is not defined (not activated)', async () => {
    const instance = new JsonRPCWeb3Connector('http://fake')
    expect(instance.getTransaction('tx-hash')).rejects.toThrow(
      errors.MUST_ACTIVATE
    )
  })
})

describe('AbstractWeb3Connector getBalance method', () => {
  // this method belongs to abstract class but since we can't test abstract classes, we tested in its child.
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })
  it('Should call getBalance from a given address', async () => {
    const spyBalance = jest
      .spyOn(ethers.providers.JsonRpcProvider.prototype, 'getBalance')
      .mockResolvedValue(ethers.BigNumber.from(toWei('1')))
    const instance = new JsonRPCWeb3Connector('http://fake')
    instance['_isActive'] = true
    const balance = await instance.getBalance('0x0001')
    expect(spyBalance).toHaveBeenCalledWith('0x0001')
    expect(balance).toBe('1.0')
  })

  it('Should throw an error if provider is not defined (not activated)', async () => {
    const instance = new JsonRPCWeb3Connector('http://fake')
    expect(instance.getBalance('0x0001')).rejects.toThrow(errors.MUST_ACTIVATE)
  })
})

describe('AbstractWeb3Connector transferBalance method', () => {
  // this method belongs to abstract class but since we can't test abstract classes, we tested in its child.
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })
  it('Should call transferBalance from provider and return an object with receipt and wait promise for confirmation', async () => {
    jest.spyOn(connectorsUtils, 'getMinConfirmations').mockReturnValue(4)
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    instance['_chainId'] = 1
    jest
      .spyOn(ethers.Wallet.prototype, 'sendTransaction')
      .mockResolvedValueOnce({
        hash: ''
      } as unknown as TransactionResponse)
    jest.spyOn(validations, 'isTransactionResponse').mockReturnValueOnce(true)
    instance['_isActive'] = true
    const tx = await instance.transferBalance('1', '0x0001')
    expect(tx).toHaveProperty('hash')
  })

  it('Should be able to call the wait function of the receipt with a custom confirmations value', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    instance['_chainId'] = 1
    jest
      .spyOn(ethers.Wallet.prototype, 'sendTransaction')
      .mockResolvedValueOnce({
        hash: ''
      } as unknown as TransactionResponse)
    jest.spyOn(validations, 'isTransactionResponse').mockReturnValueOnce(true)
    instance['_isActive'] = true
    const tx = await instance.transferBalance('1', '0x0001')
    expect(tx).toHaveProperty('hash')
  })

  it('Should throw an error if provider is not defined', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_provider'] = undefined
    expect(instance.transferBalance('1', '0x0001')).rejects.toThrow(
      errors.MUST_ACTIVATE
    )
  })

  it('Should throw an error if account is not defined', async () => {
    const instance = new JsonRPCWeb3Connector('http://fake')
    instance['_isActive'] = true
    jest
      .spyOn(JsonRPCWeb3Connector.prototype, 'isReadOnly', 'get')
      .mockReturnValueOnce(true)
    await expect(instance.transferBalance('1', '0x0001')).rejects.toThrow(
      errors.READ_ONLY('transferBalance')
    )
  })

  it('Should throw an error if amount is not a number', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    instance['_chainId'] = 1
    await expect(instance.transferBalance('a', '0x0001')).rejects.toThrow(
      errors.NOT_A_NUMBER('amount')
    )
  })
})

describe('AbstractWeb3Connector _speedUpGas method', () => {
  // this method belongs to abstract class but since we can't test abstract classes, we tested in its child.
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('Should return maxPriorityFeePerGas with a 10% increment if tx has maxPriorityFeePerGas attribute', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    const tx = instance._speedUpGas({
      maxPriorityFeePerGas: BigNumber.from('100'),
      nonce: 1
    } as unknown as TransactionResponse)
    expect(tx).toHaveProperty('maxPriorityFeePerGas')
    expect(tx.maxPriorityFeePerGas).toEqual(BigNumber.from('110'))
    expect(tx).toHaveProperty('nonce')
    expect(tx.nonce).toBe(1)
  })

  it('Should return maxPriorityFeePerGas with gasSpeed if tx has maxPriorityFeePerGas attribute and gasSpeed is provided', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    const speed = BigNumber.from('200')
    const tx = instance._speedUpGas(
      {
        maxPriorityFeePerGas: BigNumber.from('100'),
        nonce: 1
      } as unknown as TransactionResponse,
      speed
    )
    expect(tx).toHaveProperty('maxPriorityFeePerGas')
    expect(tx.maxPriorityFeePerGas).toEqual(speed)
    expect(tx).toHaveProperty('nonce')
    expect(tx.nonce).toBe(1)
  })

  it('Should return gasPrice with a 10% increment if tx does not have maxPriorityFeePerGas attribute', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    const tx = instance._speedUpGas({
      gasPrice: BigNumber.from('100'),
      nonce: 1
    } as unknown as TransactionResponse)
    expect(tx).not.toHaveProperty('maxPriorityFeePerGas')
    expect(tx).toHaveProperty('gasPrice')
    expect(tx.gasPrice).toEqual(BigNumber.from('110'))
    expect(tx).toHaveProperty('nonce')
    expect(tx.nonce).toBe(1)
  })

  it('Should return gasPrice if tx does not have maxPriorityFeePerGas attribute and gasSpeed is provided', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    const speed = BigNumber.from('200')
    const tx = instance._speedUpGas(
      {
        gasPrice: BigNumber.from('100'),
        nonce: 1
      } as unknown as TransactionResponse,
      speed
    )
    expect(tx).not.toHaveProperty('maxPriorityFeePerGas')
    expect(tx).toHaveProperty('gasPrice')
    expect(tx.gasPrice).toEqual(speed)
    expect(tx).toHaveProperty('nonce')
    expect(tx.nonce).toBe(1)
  })
})

describe('AbstractWeb3Connector cancelTransaction method', () => {
  // this method belongs to abstract class but since we can't test abstract classes, we tested in its child.
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('Should send a transaction with the same from, to and value 0', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    // mock the _speedUpGas method
    jest.spyOn(instance, '_speedUpGas').mockReturnValue({
      maxPriorityFeePerGas: BigNumber.from('110'),
      nonce: 1
    })
    const mockTransfer = jest
      .spyOn(ethers.Wallet.prototype, 'sendTransaction')
      .mockResolvedValueOnce({} as TransactionResponse)
    const tx = {
      from: '0x0001',
      to: '0x0002',
      nonce: 1,
      gasPrice: BigNumber.from('10'),
      maxPriorityFeePerGas: BigNumber.from('100')
    } as unknown as TransactionResponse
    instance['_isActive'] = true
    await expect(instance.cancelTransaction(tx)).resolves.toEqual({})
    expect(mockTransfer).toHaveBeenCalledWith({
      from: '0x0001',
      to: '0x0001',
      value: BigNumber.from('0'),
      nonce: 1,
      maxPriorityFeePerGas: BigNumber.from('110')
    })
  })

  it('Should throw an error when is not activated', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = false
    await expect(
      instance.cancelTransaction({} as unknown as TransactionResponse)
    ).rejects.toThrow(errors.MUST_ACTIVATE)
  })

  it('Should throw an error when account is not set (readonly mode)', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    jest
      .spyOn(JsonRPCWeb3Connector.prototype, 'isReadOnly', 'get')
      .mockReturnValueOnce(true)
    await expect(
      instance.cancelTransaction({} as unknown as TransactionResponse)
    ).rejects.toThrow(errors.READ_ONLY('cancelTransaction'))
  })
})

describe('AbstractWeb3Connector speedUpPercentage getter/setter', () => {
  // this method belongs to abstract class but since we can't test abstract classes, we tested in its child.
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('Should return the speedUpPercentage', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_speedUpPercentage'] = 11
    expect(instance.speedUpPercentage).toBe(11)
  })

  it('Should set the speedUpPercentage', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance.speedUpPercentage = 20
    expect(instance['_speedUpPercentage']).toBe(20)
  })
})

describe('AbstractWeb3Connector speedUpTransaction method', () => {
  // this method belongs to abstract class but since we can't test abstract classes, we tested in its child.
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('Should speed up the transaction', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    // mock the _speedUpGas method
    jest.spyOn(instance, '_speedUpGas').mockReturnValue({
      maxPriorityFeePerGas: BigNumber.from('110'),
      nonce: 1
    })
    const mockTransfer = jest
      .spyOn(ethers.Wallet.prototype, 'sendTransaction')
      .mockResolvedValueOnce({} as unknown as TransactionResponse)
    const tx = {
      from: '0x0001',
      to: '0x0002',
      nonce: 1,
      gasPrice: BigNumber.from('10'),
      maxPriorityFeePerGas: BigNumber.from('100'),
      data: '0x'
    } as unknown as TransactionResponse
    instance['_isActive'] = true
    await expect(instance.speedUpTransaction(tx)).resolves.toEqual({})
    expect(mockTransfer).toHaveBeenCalledWith({
      from: '0x0001',
      to: '0x0002',
      value: undefined,
      nonce: 1,
      maxPriorityFeePerGas: BigNumber.from('110'),
      data: '0x'
    })
  })

  it('Should speed up the transaction with custom gasSpeed', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    // mock the _speedUpGas method
    const mockSpeedUpGas = jest.spyOn(instance, '_speedUpGas').mockReturnValue({
      maxPriorityFeePerGas: BigNumber.from('110'),
      nonce: 1
    })
    const mockTransfer = jest
      .spyOn(ethers.Wallet.prototype, 'sendTransaction')
      .mockResolvedValueOnce({} as unknown as TransactionResponse)
    const tx = {
      from: '0x0001',
      to: '0x0002',
      nonce: 1,
      gasPrice: BigNumber.from('10'),
      maxPriorityFeePerGas: BigNumber.from('100'),
      data: '0x'
    } as unknown as TransactionResponse
    instance['_isActive'] = true
    const speed = BigNumber.from('100')
    await expect(instance.speedUpTransaction(tx, speed)).resolves.toEqual({})
    expect(mockTransfer).toHaveBeenCalledWith({
      from: '0x0001',
      to: '0x0002',
      value: undefined,
      nonce: 1,
      maxPriorityFeePerGas: BigNumber.from('110'),
      data: '0x'
    })
    expect(mockSpeedUpGas).toHaveBeenCalledWith(tx, speed)
  })

  it('Should throw an error when is not activated', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = false
    await expect(
      instance.speedUpTransaction({} as unknown as TransactionResponse)
    ).rejects.toThrow(errors.MUST_ACTIVATE)
  })

  it('Should throw an error when account is not set', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    jest
      .spyOn(JsonRPCWeb3Connector.prototype, 'isReadOnly', 'get')
      .mockReturnValueOnce(true)
    await expect(
      instance.speedUpTransaction({} as unknown as TransactionResponse)
    ).rejects.toThrow(errors.READ_ONLY('speedUpTransaction'))
  })
})

describe('AbstractWeb3Connector changeTransaction method', () => {
  // this method belongs to abstract class but since we can't test abstract classes, we tested in its child.
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('Should change the transaction', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    // mock the _speedUpGas method
    jest.spyOn(instance, '_speedUpGas').mockReturnValue({
      maxPriorityFeePerGas: BigNumber.from('110'),
      nonce: 1
    })
    const mockTransfer = jest
      .spyOn(ethers.Wallet.prototype, 'sendTransaction')
      .mockResolvedValueOnce({} as TransactionResponse)
    const tx = {
      from: '0x0001',
      to: '0x0002',
      nonce: 1,
      gasPrice: BigNumber.from('10'),
      maxPriorityFeePerGas: BigNumber.from('100'),
      data: '0x0001'
    } as unknown as TransactionResponse
    instance['_isActive'] = true
    const mockParseTx = jest.fn().mockImplementation(
      () =>
        ({
          args: {
            0: '0x0001',
            address: BigNumber.from('10')
          }, // this is actually an array, but ethers makes a wierd thing where it also has keys with its values
          functionFragment: {
            inputs: [
              {
                name: 'address',
                type: 'address'
              } as unknown as ParamType,
              {
                name: 'value',
                type: 'uint256'
              } as unknown as ParamType
            ]
          } as unknown as FunctionFragment,
          name: 'funcName',
          signature: 'funcName(address)',
          value: BigNumber.from('0')
        } as unknown as TransactionDescription)
    )
    const fakeInterface = {
      parseTransaction: mockParseTx,
      encodeFunctionData: jest.fn().mockReturnValue('0x0003')
    } as unknown as ethers.utils.Interface

    await expect(
      instance.changeTransaction(tx, fakeInterface, { address: '0x003' })
    ).resolves.toEqual({})
    expect(mockTransfer).toHaveBeenCalledWith({
      from: '0x0001',
      to: '0x0002',
      value: undefined,
      nonce: 1,
      maxPriorityFeePerGas: BigNumber.from('110'),
      data: '0x0003'
    })
  })

  it('should throw an error when txReceipt is not provided', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    await expect(instance.changeTransaction()).rejects.toThrow(
      errors.IS_REQUIRED('txReceipt')
    )
  })

  it('should throw an error when interface is not provided', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    await expect(
      instance.changeTransaction({} as unknown as TransactionResponse)
    ).rejects.toThrow(errors.IS_REQUIRED('iface'))
  })

  it('should throw an error if newParams is not provided', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    await expect(
      instance.changeTransaction(
        {} as unknown as TransactionResponse,
        {} as ethers.utils.Interface
      )
    ).rejects.toThrow(errors.IS_REQUIRED('newParams'))
  })

  it('should throw an error if not activated', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = false
    await expect(
      instance.changeTransaction(
        {} as unknown as TransactionResponse,
        {} as ethers.utils.Interface,
        {}
      )
    ).rejects.toThrow(errors.MUST_ACTIVATE)
  })

  it('should throw an error if account is not set', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    jest
      .spyOn(JsonRPCWeb3Connector.prototype, 'isReadOnly', 'get')
      .mockReturnValueOnce(true)
    await expect(
      instance.changeTransaction(
        {} as unknown as TransactionResponse,
        {} as ethers.utils.Interface,
        {}
      )
    ).rejects.toThrow(errors.READ_ONLY('changeTransaction'))
  })

  it('should throw an error if inputParam not found in interface', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    const mockParseTx = jest.fn().mockImplementation(
      () =>
        ({
          args: {
            0: '0x0001',
            address: BigNumber.from('10')
          }, // this is actually an array, but ethers makes a wierd thing where it also has keys with its values
          functionFragment: {
            inputs: [
              {
                name: 'address',
                type: 'address'
              } as unknown as ParamType,
              {
                name: 'value',
                type: 'uint256'
              } as unknown as ParamType
            ]
          } as unknown as FunctionFragment,
          name: 'funcName',
          signature: 'funcName(address)',
          value: BigNumber.from('0')
        } as unknown as TransactionDescription)
    )
    const fakeInterface = {
      parseTransaction: mockParseTx,
      encodeFunctionData: jest.fn().mockReturnValue('0x0003')
    } as unknown as ethers.utils.Interface
    await expect(
      instance.changeTransaction(
        {} as unknown as TransactionResponse,
        fakeInterface,
        { badAddress: '0x003' }
      )
    ).rejects.toThrow(errors.INVALID_PARAMETER('badAddress'))
  })

  it('should throw an error if parameter type is incorrect and is not a number', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    const mockParseTx = jest.fn().mockImplementation(
      () =>
        ({
          args: {
            0: '0x0001',
            address: BigNumber.from('10')
          }, // this is actually an array, but ethers makes a wierd thing where it also has keys with its values
          functionFragment: {
            inputs: [
              {
                name: 'address',
                type: 'address'
              } as unknown as ParamType,
              {
                name: 'value',
                type: 'uint256'
              } as unknown as ParamType
            ]
          } as unknown as FunctionFragment,
          name: 'funcName',
          signature: 'funcName(address)',
          value: BigNumber.from('0')
        } as unknown as TransactionDescription)
    )
    const fakeInterface = {
      parseTransaction: mockParseTx,
      encodeFunctionData: jest.fn().mockReturnValue('0x0003')
    } as unknown as ethers.utils.Interface
    await expect(
      instance.changeTransaction(
        {} as unknown as TransactionResponse,
        fakeInterface,
        { address: true }
      )
    ).rejects.toThrow(errors.INVALID_PARAM_TYPE('address', 'string', 'boolean'))
  })

  it('should throw an error if parameter type is incorrect and is a number', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    const mockParseTx = jest.fn().mockImplementation(
      () =>
        ({
          args: {
            0: '0x0001',
            address: BigNumber.from('10')
          }, // this is actually an array, but ethers makes a wierd thing where it also has keys with its values
          functionFragment: {
            inputs: [
              {
                name: 'address',
                type: 'address'
              } as unknown as ParamType,
              {
                name: 'value',
                type: 'uint256'
              } as unknown as ParamType
            ]
          } as unknown as FunctionFragment,
          name: 'funcName',
          signature: 'funcName(address)',
          value: BigNumber.from('0')
        } as unknown as TransactionDescription)
    )
    const fakeInterface = {
      parseTransaction: mockParseTx,
      encodeFunctionData: jest.fn().mockReturnValue('0x0003')
    } as unknown as ethers.utils.Interface
    await expect(
      instance.changeTransaction(
        {} as unknown as TransactionResponse,
        fakeInterface,
        { value: '1.1' }
      )
    ).rejects.toThrow(errors.NOT_BIGNUMBERISH('value'))
  })
})

describe('AbstractWeb3Connector signTypedData method', () => {
  // this method belongs to abstract class but since we can't test abstract classes, we tested in its child.
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it('Should throw an error if the connector not active', async () => {
    const connector = new JsonRPCWeb3Connector('http://fake')

    await expect(
      connector.signTypedData({} as EIP2612PermitTypedDataSigner)
    ).rejects.toThrow(errors.MUST_ACTIVATE)
  })

  it('Should throw an error if the connector has no account', async () => {
    const connector = new JsonRPCWeb3Connector('http://fake')
    connector['_isActive'] = true
    jest
      .spyOn(JsonRPCWeb3Connector.prototype, 'isReadOnly', 'get')
      .mockReturnValueOnce(true)

    await expect(
      connector.signTypedData({} as EIP2612PermitTypedDataSigner)
    ).rejects.toThrow(errors.READ_ONLY('signTypedData'))
  })

  it('Should call the sign method of the TypedDataSigner with the connectors account', async () => {
    jest.doMock('../../utils/typed-data', () => ({
      EIP2612PermitTypedDataSigner: jest.fn().mockImplementationOnce(() => ({
        sign: jest.fn().mockResolvedValue('0x123')
      }))
    }))
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { EIP2612PermitTypedDataSigner } = require('../../utils/typed-data')
    const connector = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    connector['_isActive'] = true
    const signer = new EIP2612PermitTypedDataSigner({}, {})

    const signature = await connector.signTypedData(signer)

    expect(signer.sign).toHaveBeenCalled()
    expect(signer.sign).toHaveBeenCalledWith(connector.account)
    expect(signature).toBe('0x123')
  })
})

describe('AbstractWeb3Connector detectLegacyChain method', () => {
  // this method belongs to abstract class but since we can't test abstract classes, we tested in its child.
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it('Should throw an error if the connector not active', async () => {
    const connector = new JsonRPCWeb3Connector('http://fake')

    await expect(connector.detectLegacyChain()).rejects.toThrow(
      errors.MUST_ACTIVATE
    )
  })

  it('Should set _isLegacy with true when maxFeePerGas is null', async () => {
    const connector = new JsonRPCWeb3Connector('http://fake')
    connector['_isActive'] = true
    const mockGetFeeData = jest
      .spyOn(ethers.providers.JsonRpcProvider.prototype, 'getFeeData')
      .mockResolvedValueOnce({
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        gasPrice: BigNumber.from('1')
      })

    await connector.detectLegacyChain()

    expect(mockGetFeeData).toHaveBeenCalled()
    expect(connector['_isLegacy']).toBe(true)
  })

  it('Should set _isLegacy with false when maxFeePerGas is not null', async () => {
    const connector = new JsonRPCWeb3Connector('http://fake')
    connector['_isActive'] = true
    const mockGetFeeData = jest
      .spyOn(ethers.providers.JsonRpcProvider.prototype, 'getFeeData')
      .mockResolvedValueOnce({
        maxFeePerGas: BigNumber.from('1'),
        maxPriorityFeePerGas: BigNumber.from('1'),
        gasPrice: null
      })

    await connector.detectLegacyChain()

    expect(mockGetFeeData).toHaveBeenCalled()
    expect(connector['_isLegacy']).toBe(false)
  })
})

describe('AbstractWeb3Connector changeBalanceTransaction method', () => {
  // this method belongs to abstract class but since we can't test abstract classes, we tested in its child.
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('Should change the transaction', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    const newTo = '0x00000000002'
    const newValue = BigNumber.from('42')
    // mock the _speedUpGas method
    jest.spyOn(instance, '_speedUpGas').mockReturnValue({
      maxPriorityFeePerGas: BigNumber.from('110'),
      nonce: 1
    })
    const mockTransfer = jest
      .spyOn(ethers.Wallet.prototype, 'sendTransaction')
      .mockResolvedValueOnce({} as TransactionResponse)
    const tx = {
      from: '0x0001',
      to: '0x0002',
      nonce: 1,
      gasPrice: BigNumber.from('10'),
      maxPriorityFeePerGas: BigNumber.from('100'),
      data: '0x0001'
    } as unknown as TransactionResponse
    instance['_isActive'] = true

    await expect(
      instance.changeBalanceTransaction(tx, newTo, newValue)
    ).resolves.toEqual({})
    expect(mockTransfer).toHaveBeenCalledWith({
      from: tx.from,
      to: newTo,
      value: newValue,
      nonce: tx.nonce,
      maxPriorityFeePerGas: BigNumber.from('110'),
    })
  })

  it('Should change the transaction replace only "to" attribute', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    const newTo = '0x00000000002'
    // mock the _speedUpGas method
    jest.spyOn(instance, '_speedUpGas').mockReturnValue({
      maxPriorityFeePerGas: BigNumber.from('110'),
      nonce: 1
    })
    const mockTransfer = jest
      .spyOn(ethers.Wallet.prototype, 'sendTransaction')
      .mockResolvedValueOnce({} as TransactionResponse)
    const tx = {
      from: '0x0001',
      to: '0x0002',
      nonce: 1,
      gasPrice: BigNumber.from('10'),
      maxPriorityFeePerGas: BigNumber.from('100'),
      data: '0x0001'
    } as unknown as TransactionResponse
    instance['_isActive'] = true

    await expect(
      instance.changeBalanceTransaction(tx, newTo)
    ).resolves.toEqual({})
    expect(mockTransfer).toHaveBeenCalledWith({
      from: tx.from,
      to: newTo,
      value: tx.value,
      nonce: tx.nonce,
      maxPriorityFeePerGas: BigNumber.from('110'),
    })
  })

  it('Should change the transaction replace only "value" attribute', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    const newValue = BigNumber.from('42')
    // mock the _speedUpGas method
    jest.spyOn(instance, '_speedUpGas').mockReturnValue({
      maxPriorityFeePerGas: BigNumber.from('110'),
      nonce: 1
    })
    const mockTransfer = jest
      .spyOn(ethers.Wallet.prototype, 'sendTransaction')
      .mockResolvedValueOnce({} as TransactionResponse)
    const tx = {
      from: '0x0001',
      to: '0x0002',
      nonce: 1,
      gasPrice: BigNumber.from('10'),
      maxPriorityFeePerGas: BigNumber.from('100'),
      data: '0x0001'
    } as unknown as TransactionResponse
    instance['_isActive'] = true

    await expect(
      instance.changeBalanceTransaction(tx, undefined, newValue)
    ).resolves.toEqual({})
    expect(mockTransfer).toHaveBeenCalledWith({
      from: tx.from,
      to: tx.to,
      value: newValue,
      nonce: tx.nonce,
      maxPriorityFeePerGas: BigNumber.from('110'),
    })
  })

  it('should throw an error when txReceipt is not provided', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    await expect(instance.changeBalanceTransaction()).rejects.toThrow(
      errors.IS_REQUIRED('txReceipt')
    )
  })

  it('should throw an error if not activated', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = false
    await expect(
      instance.changeBalanceTransaction(
        {} as unknown as TransactionResponse,
      )
    ).rejects.toThrow(errors.MUST_ACTIVATE)
  })

  it('should throw an error if account is not set', async () => {
    const instance = new JsonRPCWeb3Connector(
      'http://fake',
      'f31fa21342dafa7de378d8e19cd296dd905988e085d3950dcc35cbadac764d4a'
    )
    instance['_isActive'] = true
    jest
      .spyOn(JsonRPCWeb3Connector.prototype, 'isReadOnly', 'get')
      .mockReturnValueOnce(true)
    await expect(
      instance.changeBalanceTransaction(
        {} as unknown as TransactionResponse,
      )
    ).rejects.toThrow(errors.READ_ONLY('changeBalanceTransaction'))
  })
})