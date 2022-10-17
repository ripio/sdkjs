import { ExecuteResponse } from './../../types/interfaces'
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from 'events'
import { Contract, ethers, EventFilter, Signer, Wallet } from 'ethers'
import { ProviderEvents } from '../../connectors/events'
import JsonRPCWeb3Connector from '../../connectors/JsonRPCWeb3Connector'
import BrowserWeb3Connector from '../../connectors/BrowserWeb3Connector'

import { ContractManager } from '../../managers'
import errors from '../../types/errors'
import { ConnectInfo, ProviderRpcError } from '../../types/interfaces'
import * as connectors from '../../utils/connectors'
import { BaseProvider } from '@ethersproject/providers'
import { Interface, ParamType } from 'ethers/lib/utils'
import { FilterEvent } from '../../utils/validations'
import { Event } from '@ethersproject/contracts'
import { conversions, validations } from '../../utils'

describe('ContractManager instance and activate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const spyValidateStandard = jest.spyOn(
    ContractManager.prototype,
    'validateStandard'
  )

  it('should instanciate the sdk', async () => {
    const sdk = new ContractManager()
    expect(sdk).toBeDefined()
    expect(sdk).toBeInstanceOf(ContractManager)
  })

  it('should activate the sdk with JsonRPCWeb3Connector', async () => {
    const sdk = new ContractManager()
    const mockProviderOn = jest.fn()
    const connectorResponse = {
      account: undefined,
      provider: {
        on: mockProviderOn,
        _isProvider: true
      } as unknown as ethers.providers.Provider,
      activate: () => {}
    } as unknown as JsonRPCWeb3Connector
    const mockGetConnector = jest.fn()
    sdk['selectConnector'] = mockGetConnector
    sdk['_connector'] = connectorResponse

    await sdk.activate({
      contractAddress: '0x0000000000000000000000000000000000000000',
      contractAbi: [],
      providerUrl: 'http://localhost:8545',
      privateKey:
        '0x0000000000000000000000000000000000000000000000000000000000000000'
    })
    expect(mockGetConnector).toBeCalledWith(
      'http://localhost:8545',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      undefined
    )
    expect(mockProviderOn).toBeCalledWith(
      ProviderEvents.ACCOUNT_CHANGED,
      sdk['handleAccountChanged']
    )
    expect(mockProviderOn).toBeCalledWith(
      ProviderEvents.CHAIN_CHANGED,
      sdk['handleChainChanged']
    )
    expect(mockProviderOn).toBeCalledWith(
      ProviderEvents.CONNECT,
      sdk['handleConnect']
    )
    expect(mockProviderOn).toBeCalledWith(
      ProviderEvents.DISCONNECT,
      sdk['handleDisconnect']
    )
    expect(spyValidateStandard).toBeCalled()
    expect(sdk['_connector']).not.toBeUndefined()
    expect(sdk['_connector']).toBe(connectorResponse)
    expect(sdk['_contract']).toBeDefined()
    expect(sdk['_contract']).not.toBeNull()
    expect(sdk['_abi']).toBeDefined()
    expect(sdk['_contract']!.provider).toBeDefined()
    expect(sdk['_contract']!.provider).not.toBeNull()
    expect(sdk['_contract']!.signer).toBeNull()
    expect(sdk['_isActivating']).toBe(false)
    expect(sdk['_isActive']).toBe(true)
  })

  it('should activate the sdk with a provider and a signer', async () => {
    const sdk = new ContractManager()
    const mockProviderOn = jest.fn()
    const connectorResponse = {
      account: {
        _isSigner: true,
        provider: {
          _isProvider: true
        } as unknown
      } as ethers.Signer,
      provider: {
        on: mockProviderOn,
        _isProvider: true
      } as unknown as ethers.providers.Provider,
      activate: () => {}
    } as unknown as JsonRPCWeb3Connector
    const mockGetConnector = jest.fn()
    sdk['selectConnector'] = mockGetConnector
    sdk['_connector'] = connectorResponse

    await sdk.activate({
      contractAddress: '0x0000000000000000000000000000000000000000',
      contractAbi: [],
      providerUrl: 'http://localhost:8545',
      privateKey:
        '0x0000000000000000000000000000000000000000000000000000000000000000'
    })
    expect(mockGetConnector).toBeCalledWith(
      'http://localhost:8545',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      undefined
    )
    expect(mockProviderOn).toBeCalledWith(
      ProviderEvents.ACCOUNT_CHANGED,
      sdk['handleAccountChanged']
    )
    expect(mockProviderOn).toBeCalledWith(
      ProviderEvents.CHAIN_CHANGED,
      sdk['handleChainChanged']
    )
    expect(mockProviderOn).toBeCalledWith(
      ProviderEvents.CONNECT,
      sdk['handleConnect']
    )
    expect(mockProviderOn).toBeCalledWith(
      ProviderEvents.DISCONNECT,
      sdk['handleDisconnect']
    )
    expect(spyValidateStandard).toBeCalled()
    expect(sdk['_connector']).toBe(connectorResponse)
    expect(sdk['_contract']).toBeDefined()
    expect(sdk['_contract']).not.toBe(null)
    expect(sdk['_abi']).toBeDefined()
    expect(sdk['_contract']!.provider).toBeDefined()
    expect(sdk['_contract']!.provider).not.toBe(null)
    expect(sdk['_contract']!.signer).toBe(connectorResponse.account)
    expect(sdk['_isActivating']).toBe(false)
    expect(sdk['_isActive']).toBe(true)
  })

  it('should activate the sdk with BrowserWeb3Connector', async () => {
    // this test could be removed, is kindoff redundant.
    const sdk = new ContractManager()
    const mockProviderOn = jest.fn()
    const connectorResponse = {
      account: {
        _isSigner: true,
        provider: {
          _isProvider: true
        } as unknown
      } as ethers.Signer,
      provider: {
        on: mockProviderOn,
        _isProvider: true
      } as unknown as ethers.providers.Provider,
      activate: () => {}
    } as unknown as JsonRPCWeb3Connector

    const mockGetConnector = jest.fn()
    sdk['selectConnector'] = mockGetConnector
    sdk['_connector'] = connectorResponse

    await sdk.activate({
      contractAddress: '0x0000000000000000000000000000000000000000',
      contractAbi: []
    })

    expect(mockGetConnector).toBeCalledWith(undefined, undefined, undefined)
    expect(mockProviderOn).toBeCalledWith(
      ProviderEvents.ACCOUNT_CHANGED,
      sdk['handleAccountChanged']
    )
    expect(mockProviderOn).toBeCalledWith(
      ProviderEvents.CHAIN_CHANGED,
      sdk['handleChainChanged']
    )
    expect(mockProviderOn).toBeCalledWith(
      ProviderEvents.CONNECT,
      sdk['handleConnect']
    )
    expect(mockProviderOn).toBeCalledWith(
      ProviderEvents.DISCONNECT,
      sdk['handleDisconnect']
    )
    expect(spyValidateStandard).toBeCalled()
    expect(sdk['_connector']).toBe(connectorResponse)
    expect(sdk['_contract']).toBeDefined()
    expect(sdk['_contract']).not.toBe(null)
    expect(sdk['_abi']).toBeDefined()
    expect(sdk['_contract']?.provider).toBeDefined()
    expect(sdk['_contract']?.provider).not.toBe(null)
    expect(sdk['_contract']?.signer).toBe(connectorResponse.account)
    expect(sdk['_isActivating']).toBe(false)
    expect(sdk['_isActive']).toBe(true)
  })

  it('should throw an error when attempting to activate and is already activating', async () => {
    const sdk = new ContractManager()
    sdk['_isActivating'] = true
    await expect(
      sdk.activate({
        contractAddress: '',
        contractAbi: []
      })
    ).rejects.toThrowError(errors.SDK_ACTIVATION_IN_PROGRESS)
  })

  it('should throw a custom error when an error occurs during activation', async () => {
    const sdk = new ContractManager()
    const error = new Error('Winter is coming')
    sdk['selectConnector'] = () => {
      throw error
    }
    await expect(
      sdk.activate({
        contractAddress: '',
        contractAbi: []
      })
    ).rejects.toThrowError(errors.SDK_ACTIVATION_FAILED(error))
    expect(sdk['_isActivating']).toBe(false)
  })
})

describe('ContractManager deactivate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should deactivate, remove listeners and unset sdk activated properties when is not activating and is active', async () => {
    const sdk = new ContractManager()
    const mockProviderOn = jest.fn()
    const mockRemoveListener = jest.fn()
    const connectorResponse = {
      account: null,
      provider: {
        on: mockProviderOn,
        removeListener: mockRemoveListener,
        _isProvider: true
      } as unknown as ethers.providers.Provider
    } as unknown as JsonRPCWeb3Connector

    const mockGetConnector = jest.fn()
    sdk['selectConnector'] = mockGetConnector
    sdk['_connector'] = connectorResponse
    sdk['_isActivating'] = false
    sdk['_isActive'] = true

    sdk.deactivate()
    expect(sdk['_connector']).toBe(undefined)
    expect(sdk['_contract']).toBe(undefined)
    expect(sdk['_abi']).toBe(undefined)
    expect(sdk['_isActivating']).toBe(false)
    expect(sdk['_isActive']).toBe(false)
    expect(mockRemoveListener).toBeCalledWith(
      ProviderEvents.ACCOUNT_CHANGED,
      sdk['handleAccountChanged']
    )
    expect(mockRemoveListener).toBeCalledWith(
      ProviderEvents.CHAIN_CHANGED,
      sdk['handleChainChanged']
    )
    expect(mockRemoveListener).toBeCalledWith(
      ProviderEvents.CONNECT,
      sdk['handleConnect']
    )
    expect(mockRemoveListener).toBeCalledWith(
      ProviderEvents.DISCONNECT,
      sdk['handleDisconnect']
    )
  })

  it('should not deactivate and throw an error when is activating', () => {
    const sdk = new ContractManager()
    sdk['_isActivating'] = true
    expect(() => {
      sdk.deactivate()
    }).toThrowError(errors.SDK_ACTIVATION_IN_PROGRESS)
  })

  it('should not remove listeners when deactivating if it is not active', () => {
    const sdk = new ContractManager()
    const connector = new JsonRPCWeb3Connector('')
    const mockProviderOn = jest.fn()
    const mockRemoveListener = jest.fn()
    const connectorResponse = {
      account: null,
      provider: {
        on: mockProviderOn,
        removeListener: mockRemoveListener,
        _isProvider: true
      } as unknown as ethers.providers.Provider,
      chainId: 1
    }
    const mockConnectorActivate = jest
      .fn()
      .mockResolvedValueOnce(connectorResponse)
    connector['activate'] = mockConnectorActivate

    expect(sdk['_isActive']).toBe(false)
    sdk.deactivate()
    expect(sdk['_connector']).toBe(undefined)
    expect(sdk['_contract']).toBe(undefined)
    expect(sdk['_abi']).toBe(undefined)
    expect(sdk['_isActivating']).toBe(false)
    expect(sdk['_isActive']).toBe(false)

    expect(mockRemoveListener).not.toBeCalled()
  })
})

describe('ContractManager execute function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('Should execute a function on safe mode and succed', async () => {
    const sdk = new ContractManager()
    const spyRequireParam = jest
      .spyOn(validations, 'requireParam')
      .mockImplementation(() => {})
    const method = 'test'
    const param1 = 'param1'
    const mockMethod = jest.fn().mockResolvedValueOnce(true)
    const mockStaticMethod = jest.fn().mockResolvedValueOnce(true)
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [{ name: param1, type: 'address' }],
      format: () => method
    })
    const mockGetExecuteResponse = jest
      .spyOn(conversions, 'getExecuteResponse')
      .mockReturnValueOnce(true as unknown as ExecuteResponse)
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod,
      callStatic: {
        [method]: mockStaticMethod
      }
    } as unknown as Contract
    const response = await sdk.execute({ method, params: [param1] })
    expect(response).toBeTruthy()
    expect(mockGetFunction).toBeCalledWith(method)
    expect(mockStaticMethod).toBeCalledWith(param1, {})
    expect(mockMethod).toBeCalledWith(param1, {})
    expect(mockGetExecuteResponse).toBeCalledWith(
      response,
      sdk['_connector'],
      sdk['_abi']
    )
    expect(spyRequireParam).toBeCalledWith(
      [sdk.connector?.provider, sdk.contract, sdk.abi],
      errors.SDK_NOT_INITIALIZED
    )
  })

  it('Should throw an error when executing a function on safe mode and avoid sending the transaction', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const param1 = 'param1'
    const mockMethod = jest.fn().mockRejectedValueOnce(true)
    const mockStaticMethod = jest.fn().mockRejectedValueOnce(true)
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [{ name: param1, type: 'address' }],
      format: () => method
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod,
      callStatic: {
        [method]: mockStaticMethod
      }
    } as unknown as Contract
    await expect(
      sdk.execute({ method, params: [param1] })
    ).rejects.toThrowError(errors.TRANSACTION_FAILED())
    expect(mockGetFunction).toBeCalledWith(method)
    expect(mockStaticMethod).toBeCalledWith(param1, {})
    expect(mockMethod).not.toBeCalled()
  })

  it('should execute a payable function providing the value', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const tx = {}
    const mockGetExecuteResponse = jest
      .spyOn(conversions, 'getExecuteResponse')
      .mockReturnValueOnce(tx as unknown as ExecuteResponse)
    const mockMethod = jest.fn().mockReturnValueOnce(tx)
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: true,
      inputs: [],
      format: () => method
    })
    sdk.safeMode = false
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    const response = await sdk.execute({ method, value: '1' })
    expect(response).toBeTruthy()
    expect(mockGetFunction).toBeCalledWith(method)
    expect(mockMethod).toBeCalledWith({
      value: ethers.BigNumber.from('1000000000000000000')
    })
    expect(mockGetExecuteResponse).toHaveBeenCalledWith(
      tx,
      sdk['_connector'],
      sdk['_abi']
    )
  })

  it('should throw an error when executing a non payable func providing a value', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [],
      format: () => method
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {} as Contract
    await expect(sdk.execute({ method, value: '1' })).rejects.toThrow(
      errors.NOT_PAYABLE_METHOD_WITH_VALUE_PROVIDED
    )
    expect(mockGetFunction).toBeCalledWith(method)
  })

  it('should throw an error when executing a payable func providing an invalid value', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: true,
      inputs: [],
      format: () => method
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {} as Contract
    await expect(sdk.execute({ method, value: 'a' })).rejects.toThrow(
      errors.INVALID_VALUE_TYPE
    )
    expect(mockGetFunction).toBeCalledWith(method)
  })

  it('should throw an error when sdk was not initialized', async () => {
    const sdk = new ContractManager()
    await expect(sdk.execute({ method: 'test' })).rejects.toThrow(
      errors.SDK_NOT_INITIALIZED
    )
  })

  it('should throw an error when function name does not exist in contract', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const error = new Error('getFunction error')
    const mockGetFunction = jest.fn().mockImplementationOnce(() => {
      throw error
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {} as Contract
    await expect(sdk.execute({ method })).rejects.toThrow(
      errors.UNKNOWN_METHOD(method)
    )
    expect(mockGetFunction).toBeCalledWith(method)
  })

  it('should throw an error when function name does not exist in contract and try to suggest a function name but did not find any', async () => {
    const sdk = new ContractManager()
    const method = 'test()'
    const error = new Error('getFunction error')
    const mockGetFunction = jest.fn().mockImplementationOnce(() => {
      throw error
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {} as Contract
    await expect(sdk.execute({ method })).rejects.toThrow(
      errors.UNKNOWN_METHOD(method)
    )
    expect(mockGetFunction).toBeCalledWith(method)
  })

  it('should throw an error when function name does not exist in contract and suggest a function name if overflow', async () => {
    const sdk = new ContractManager()
    const method = 'test()'
    const methodOverloaded = 'test(string)'
    const error = new Error('getFunction error')
    const mockPosibleMethod = jest.fn()
    const mockPosibleMethodOverloaded = jest.fn()
    const mockGetFunction = jest.fn().mockImplementationOnce(() => {
      throw error
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockPosibleMethod,
      [methodOverloaded]: mockPosibleMethodOverloaded
    } as unknown as Contract
    await expect(sdk.execute({ method })).rejects.toThrow(
      errors.UNKNOWN_METHOD_WITH_RECOMENDATION(
        method,
        [method, methodOverloaded].join(', ')
      )
    )
    expect(mockGetFunction).toBeCalledWith(method)
  })

  it('should throw an error if function is payable and no value was provided', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: true,
      inputs: [],
      format: () => method
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {} as Contract
    await expect(sdk.execute({ method })).rejects.toThrow(
      errors.PAYABLE_METHOD_REQUIRED_VALUE
    )
    expect(mockGetFunction).toBeCalledWith(method)
  })

  it('should throw an error if function params length mismatch', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [
        { name: 'a', type: 'uint256' },
        { name: 'b', type: 'uint256' }
      ],
      format: () => method
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {} as Contract
    await expect(sdk.execute({ method, params: [1] })).rejects.toThrow(
      errors.INVALID_PARAMETER_COUNT(2, 1)
    )
    expect(mockGetFunction).toBeCalledWith(method)
  })

  it('should throw a list of errors if function params type mismatch', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const param2 = 'param2'
    const param3 = 'param3'
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [
        {
          name: param2,
          type: 'address'
        },
        {
          name: param3,
          type: 'int8'
        }
      ],
      format: () => method
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {} as Contract
    await expect(
      sdk.execute({ method, params: [1, '12.3'] })
    ).rejects.toStrictEqual([
      errors.INVALID_PARAM_TYPE(param2, 'string', 'number'),
      errors.NOT_BIGNUMBERISH(param3)
    ])
    expect(mockGetFunction).toBeCalledWith(method)
  })

  it('should throw an error if the function call fails', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const param1 = 'param1'
    const cause = new Error('method error')
    const mockMethod = jest.fn().mockImplementationOnce(() => {
      throw cause
    })
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [{ name: param1, type: 'address' }],
      format: () => method
    })
    sdk.safeMode = false
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    await expect(sdk.execute({ method, params: [param1] })).rejects.toThrow(
      errors.TRANSACTION_FAILED(cause)
    )
    expect(mockGetFunction).toBeCalledWith(method)
    expect(mockMethod).toBeCalledWith(param1, {})
  })

  it('Should override the default gasLimit', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const param1 = 'param1'
    const mockMethod = jest.fn().mockImplementationOnce(() => {
      return 'result'
    })
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [{ name: param1, type: 'address' }],
      format: () => method
    })
    jest.spyOn(conversions, 'extendTransactionResponse')
    sdk.safeMode = false
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    await sdk.execute({
      method,
      params: [param1],
      overrides: { gasLimit: 100 }
    })
    expect(mockMethod).toBeCalledWith(param1, { gasLimit: 100 })
  })

  it('Should throw an error if gasLimit is not BigNumberish', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const mockMethod = jest.fn().mockImplementationOnce(() => {
      return 'result'
    })
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [],
      format: () => method
    })
    jest.spyOn(conversions, 'extendTransactionResponse')
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    await expect(
      sdk.execute({
        method,
        params: [],
        overrides: { gasLimit: '42.42' }
      })
    ).rejects.toThrow(errors.INVALID_PARAMETER('gasLimit'))
  })

  it('Should throw an error if maxPriorityFeePerGas is not BigNumberish', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const mockMethod = jest.fn().mockImplementationOnce(() => {
      return 'result'
    })
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [],
      format: () => method
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    await expect(
      sdk.execute({
        method,
        params: [],
        overrides: { maxPriorityFeePerGas: '42.42' }
      })
    ).rejects.toThrow(errors.INVALID_PARAMETER('maxPriorityFeePerGas'))
  })

  it('Should throw an error if it is legacyChain when we use maxPriorityFeePerGas', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const mockMethod = jest.fn().mockImplementationOnce(() => {
      return 'result'
    })
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [],
      format: () => method
    })
    const mockIsLegacy = jest.fn().mockImplementationOnce(() => {
      return true
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider,
      isLegacy: mockIsLegacy
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    await expect(
      sdk.execute({
        method,
        params: [],
        overrides: { maxPriorityFeePerGas: 100 }
      })
    ).rejects.toThrow(
      errors.PARAMETER_NOT_SUPPORTED_ON_LEGACY_CHAIN('maxPriorityFeePerGas')
    )
  })

  it('Should override the default maxPriorityFeePerGas', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const param1 = 'param1'
    const mockMethod = jest.fn().mockImplementationOnce(() => {
      return 'result'
    })
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [{ name: param1, type: 'address' }],
      format: () => method
    })
    jest.spyOn(conversions, 'extendTransactionResponse')
    sdk.safeMode = false
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    await sdk.execute({
      method,
      params: [param1],
      overrides: { maxPriorityFeePerGas: 100 }
    })
    expect(mockMethod).toBeCalledWith(param1, { maxPriorityFeePerGas: 100 })
  })

  it('Should throw an error if maxFeePerGas is not BigNumberish', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const mockMethod = jest.fn().mockImplementationOnce(() => {
      return 'result'
    })
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [],
      format: () => method
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    await expect(
      sdk.execute({
        method,
        params: [],
        overrides: { maxFeePerGas: '42.42' }
      })
    ).rejects.toThrow(errors.INVALID_PARAMETER('maxFeePerGas'))
  })

  it('Should throw an error if it is legacyChain when we use maxFeePerGas', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const mockMethod = jest.fn().mockImplementationOnce(() => {
      return 'result'
    })
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [],
      format: () => method
    })
    const mockIsLegacy = jest.fn().mockImplementationOnce(() => {
      return true
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider,
      isLegacy: mockIsLegacy
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    await expect(
      sdk.execute({
        method,
        params: [],
        overrides: { maxFeePerGas: 100 }
      })
    ).rejects.toThrow(
      errors.PARAMETER_NOT_SUPPORTED_ON_LEGACY_CHAIN('maxFeePerGas')
    )
  })

  it('Should override the default maxFeePerGas', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const param1 = 'param1'
    const mockMethod = jest.fn().mockImplementationOnce(() => {
      return 'result'
    })
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [{ name: param1, type: 'address' }],
      format: () => method
    })
    jest.spyOn(conversions, 'extendTransactionResponse')
    sdk.safeMode = false
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    await sdk.execute({
      method,
      params: [param1],
      overrides: { maxFeePerGas: 100 }
    })
    expect(mockMethod).toBeCalledWith(param1, { maxFeePerGas: 100 })
  })

  it('Should override the default gasPrice', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const param1 = 'param1'
    const mockMethod = jest.fn().mockImplementationOnce(() => {
      return 'result'
    })
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [{ name: param1, type: 'address' }],
      format: () => method
    })
    jest.spyOn(conversions, 'extendTransactionResponse')
    sdk.safeMode = false
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    await sdk.execute({
      method,
      params: [param1],
      overrides: { gasPrice: 100 }
    })
    expect(mockMethod).toBeCalledWith(param1, { gasPrice: 100 })
  })

  it('Should throw an error if gasPrice is not BigNumberish', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const mockMethod = jest.fn().mockImplementationOnce(() => {
      return 'result'
    })
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [],
      format: () => method
    })
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    await expect(
      sdk.execute({
        method,
        params: [],
        overrides: { gasPrice: '42.42' }
      })
    ).rejects.toThrow(errors.INVALID_PARAMETER('gasPrice'))
  })

  it('Should delete gasPrice on overrides values when we use maxPriorityFeePerGas', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const param1 = 'param1'
    const mockMethod = jest.fn().mockImplementationOnce(() => {
      return 'result'
    })
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [{ name: param1, type: 'address' }],
      format: () => method
    })
    jest.spyOn(conversions, 'extendTransactionResponse')
    sdk.safeMode = false
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    await sdk.execute({
      method,
      params: [param1],
      overrides: { gasPrice: 100, maxPriorityFeePerGas: 100 }
    })
    expect(mockMethod).toBeCalledWith(param1, { maxPriorityFeePerGas: 100 })
  })

  it('Should delete gasPrice on overrides values when we use maxFeePerGas', async () => {
    const sdk = new ContractManager()
    const method = 'test'
    const param1 = 'param1'
    const mockMethod = jest.fn().mockImplementationOnce(() => {
      return 'result'
    })
    const mockGetFunction = jest.fn().mockReturnValueOnce({
      payable: false,
      inputs: [{ name: param1, type: 'address' }],
      format: () => method
    })
    jest.spyOn(conversions, 'extendTransactionResponse')
    sdk.safeMode = false
    sdk['_abi'] = {
      getFunction: mockGetFunction
    } as unknown as ethers.utils.Interface
    sdk['_connector'] = {
      account: {} as Wallet,
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['_contract'] = {
      [method]: mockMethod
    } as unknown as Contract
    await sdk.execute({
      method,
      params: [param1],
      overrides: { gasPrice: 100, maxFeePerGas: 100 }
    })
    expect(mockMethod).toBeCalledWith(param1, { maxFeePerGas: 100 })
  })
})

describe('ContractManager handle events', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should set a new contract instance and emit event when calling handleAccountChanged', () => {
    const sdk = new ContractManager()
    sdk['_isActive'] = true
    sdk['_abi'] = [{}] as unknown as ethers.utils.Interface
    sdk['_contractAddr'] = '0x0'
    sdk['_contract']
    const mockEmitEvent = jest.fn()
    sdk['ContractManagerEmitter'] = {
      emit: mockEmitEvent
    } as unknown as EventEmitter
    jest.spyOn(ethers, 'Contract').mockImplementationOnce(() => {
      return {} as ethers.Contract
    })
    const newWallet = new Wallet(
      'beb04548ddd8e54c15504403977817ef9176a21406497ef01ff60d54e9c5fdd9'
    )
    sdk['_connector'] = {
      provider: {} as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector
    sdk['handleAccountChanged'](newWallet)
    expect(sdk['_contract']).toEqual({})
    expect(mockEmitEvent).toBeCalledWith(
      ProviderEvents.ACCOUNT_CHANGED,
      newWallet
    )
  })

  it('should set account and emit event when calling handleAccountChanged with a provider', () => {
    const sdk = new ContractManager()
    sdk['_isActive'] = true
    sdk['_abi'] = [{}] as unknown as ethers.utils.Interface
    sdk['_contractAddr'] = '0x0'
    sdk['_connector'] = {
      provider: Object.create(
        ethers.providers.Web3Provider.prototype
      ) as ethers.providers.Web3Provider
    } as unknown as JsonRPCWeb3Connector
    const mockEmitEvent = jest.fn()
    sdk['ContractManagerEmitter'] = {
      emit: mockEmitEvent
    } as unknown as EventEmitter
    jest.spyOn(ethers, 'Contract').mockImplementationOnce(() => {
      return {} as ethers.Contract
    })
    sdk['handleAccountChanged'](undefined)
    expect(sdk['_contract']).toEqual({})
    expect(mockEmitEvent).toBeCalledWith(
      ProviderEvents.ACCOUNT_CHANGED,
      undefined
    )
  })

  it('should throw an exception when calling handleAccountChanged when is not activated', () => {
    const sdk = new ContractManager()
    sdk['_isActive'] = false
    sdk['_abi'] = [{}] as unknown as ethers.utils.Interface
    sdk['_contractAddr'] = '0x0'
    const contract = {} as ethers.Contract
    sdk['_contract'] = contract
    const mockEmitEvent = jest.fn()
    sdk['ContractManagerEmitter'] = {
      emit: mockEmitEvent
    } as unknown as EventEmitter
    const newWallet = new Wallet(
      'beb04548ddd8e54c15504403977817ef9176a21406497ef01ff60d54e9c5fdd9'
    )
    expect(() => sdk['handleAccountChanged'](newWallet)).toThrow(
      errors.SDK_NOT_INITIALIZED
    )
    expect(sdk['_contract']).toEqual(contract)
    expect(mockEmitEvent).not.toHaveBeenCalled()
  })

  it('should set account and emit event when calling handleChainChanged', () => {
    const sdk = new ContractManager()
    const spyEmit = jest.spyOn(EventEmitter.prototype, 'emit')
    jest
      .spyOn(BaseProvider.prototype, 'getNetwork')
      .mockResolvedValue({ chainId: 1, name: 'net' })
    sdk['handleChainChanged'](1)
    expect(spyEmit).toHaveBeenCalledWith(ProviderEvents.CHAIN_CHANGED, 1)
  })

  it('should set account and emit event when calling handleConnect', () => {
    const connectInfo = { chainId: '1' }
    const sdk = new ContractManager()
    const spyEmit = jest.spyOn(EventEmitter.prototype, 'emit')
    sdk['handleConnect'](connectInfo)
    expect(spyEmit).toHaveBeenCalledWith(ProviderEvents.CONNECT, connectInfo)
  })

  it('should set account and emit event when calling handleDisconnect', () => {
    const sdk = new ContractManager()
    const spyEmit = jest.spyOn(EventEmitter.prototype, 'emit')
    const spyDeactivate = jest.spyOn(ContractManager.prototype, 'deactivate')
    const error = new Error() as ProviderRpcError
    sdk['handleDisconnect'](error)
    expect(spyEmit).toHaveBeenCalledWith(ProviderEvents.DISCONNECT, error)
    expect(spyDeactivate).toHaveBeenCalled()
  })
})

describe('ContractManager selectConnector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should assign a connector when calling selectConnector with provider and key (optionally)', async () => {
    const acc = new Wallet(
      '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada'
    )
    const prov = new ethers.providers.JsonRpcProvider()
    const connector = new JsonRPCWeb3Connector('')
    jest.spyOn(connectors, 'getConnector').mockReturnValueOnce(connector)
    jest
      .spyOn(JsonRPCWeb3Connector.prototype, 'activate')
      .mockResolvedValueOnce({ account: acc, provider: prov, chainId: 1 })
    const sdk = new ContractManager()
    await sdk['selectConnector']('ws://fake', undefined, undefined)
    expect(sdk['_connector']).toBe(connector)
  })

  it('should instantiate an account and provider (BrowserWeb3Connector) when calling getConnector without provider', async () => {
    const connector = new BrowserWeb3Connector()
    const acc = {} as ethers.providers.JsonRpcSigner
    jest.spyOn(connectors, 'getConnector').mockReturnValueOnce(connector)
    const fakeWindowProvider = {
      _isProvider: true
    } as ethers.providers.Web3Provider
    jest
      .spyOn(BrowserWeb3Connector.prototype, 'activate')
      .mockResolvedValueOnce({
        account: acc,
        provider: fakeWindowProvider,
        chainId: 1
      })
    const sdk = new ContractManager()
    await sdk['selectConnector'](undefined, undefined, undefined)
    expect(sdk['_connector']).toBe(connector)
  })

  it('Should return an account and provider with the given connector when passed as parameter', async () => {
    const sdk = new ContractManager()
    const connector = new JsonRPCWeb3Connector('')
    connector['_isActive'] = true
    await sdk['selectConnector'](undefined, undefined, connector)
    expect(sdk['_connector']).toBe(connector)
  })

  it('Should throw an error when calling selectConnector and connector is passed as parameter but is not active', async () => {
    const sdk = new ContractManager()
    const connector = new JsonRPCWeb3Connector('')
    connector['_isActive'] = false
    expect(() =>
      sdk['selectConnector'](undefined, undefined, connector)
    ).toThrow(errors.PROVIDER_NOT_INITIALIZED)
  })

  it('Should throw an error when calling selectConnector and connector is passed as parameter but has no provider', async () => {
    const sdk = new ContractManager()
    const connector = new JsonRPCWeb3Connector('')
    connector['_provider'] = undefined
    expect(() =>
      sdk['selectConnector'](undefined, undefined, connector)
    ).toThrow(errors.PROVIDER_NOT_INITIALIZED)
  })
})

describe('Getters of ContractManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should return the connector when calling connector', () => {
    const sdk = new ContractManager()
    const connector = {} as BrowserWeb3Connector
    sdk['_connector'] = connector
    expect(sdk.connector).toBe(connector)
  })

  it('should return the abi when calling abi', () => {
    const sdk = new ContractManager()
    const abi = {} as ethers.utils.Interface
    sdk['_abi'] = abi
    expect(sdk.abi).toBe(abi)
  })

  it('should return the contract when calling contract', () => {
    const sdk = new ContractManager()
    const contract = {} as ethers.Contract
    sdk['_contract'] = contract
    expect(sdk.contract).toBe(contract)
  })

  it('should return the contractAddr when calling contractAddr', () => {
    const sdk = new ContractManager()
    const contractAddr = '0x0001'
    sdk['_contractAddr'] = contractAddr
    expect(sdk.contractAddr).toBe(contractAddr)
  })

  it('should return true if the contract is instantiated with a provider but not a signer', () => {
    const sdk = new ContractManager()
    const abi = [
      { inputs: [], stateMutability: 'nonpayable', type: 'constructor' }
    ]
    const prov = new JsonRPCWeb3Connector('')
    sdk['_contract'] = new Contract('', abi, prov.provider)
    expect(sdk.isReadonly).toBe(true)
  })

  it('should return null if the contract is instantiated only with a signer', () => {
    const sdk = new ContractManager()
    const abi = [
      { inputs: [], stateMutability: 'nonpayable', type: 'constructor' }
    ]
    sdk['_contract'] = new Contract(
      '0x0169d84BfaD8d35582F9dEA506394B5DCa178B40',
      abi,
      new Wallet(
        'beb04548ddd8e54c15504403977817ef9176a21406497ef01ff60d54e9c5fdd9'
      )
    )
    expect(sdk.isReadonly).toBeNull()
  })

  it('should return false if the contract is instantiated with a signer and provider', () => {
    const sdk = new ContractManager()
    const abi = [
      { inputs: [], stateMutability: 'nonpayable', type: 'constructor' }
    ]
    const prov = new JsonRPCWeb3Connector(
      '',
      '8671f578fe61f210bec60fc2251cc0b7e1a3d2a6b0a5f8b3d5a0203d9ac27a9f'
    )
    const signer = new Wallet(
      'beb04548ddd8e54c15504403977817ef9176a21406497ef01ff60d54e9c5fdd9',
      prov.provider
    )
    sdk['_contract'] = new Contract(
      '0x0169d84BfaD8d35582F9dEA506394B5DCa178B40',
      abi,
      signer
    )
    expect(sdk.isReadonly).toBe(false)
  })

  it('should return false if the contract is not instantiated', () => {
    const sdk = new ContractManager()
    sdk['_contract'] = undefined
    expect(sdk.isReadonly).toBeNull()
  })

  it('should return the _isActive attribute when calling isActive', () => {
    const sdk = new ContractManager()
    sdk['_isActive'] = true
    expect(sdk.isActive).toBe(true)
    sdk['_isActive'] = false
    expect(sdk.isActive).toBe(false)
  })

  it('should return the _contractEvents attribute when calling contractEvents if variable is defined', () => {
    const spyValues = jest.spyOn(Object, 'values')
    const sdk = new ContractManager()
    const events = [{ name: 'eventName', inputs: [{} as unknown as ParamType] }]
    sdk['_contractEvents'] = events
    expect(sdk.contractEvents).toBe(events)
    expect(spyValues).not.toHaveBeenCalled()
  })

  it('should return the _contractEvents attribute when calling contractEvents for the first time', () => {
    const spyValues = jest.spyOn(Object, 'values')
    const sdk = new ContractManager()
    sdk['_abi'] = {
      events: {
        'Approval(address,address,uint256)': {
          name: 'Approval',
          inputs: [{} as unknown as ParamType]
        }
      }
    } as unknown as Interface
    expect(sdk.contractEvents).toEqual([{ name: 'Approval', inputs: [{}] }])
    expect(spyValues).toHaveBeenCalled()
  })

  it('should instanciate with safeMode attribute as true', () => {
    const sdk = new ContractManager()
    expect(sdk.safeMode).toBe(true)
  })
})

describe('Event handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should emit an event thrown by the provider when subscribed to the sdk successfuly', () => {
    const sdk = new ContractManager()
    const mockOnEvent = jest.fn()
    const mockOnceEvent = jest.fn()
    const mockEmitEvent = jest.fn()
    const mockRemoveEvent = jest.fn()
    const mockListenAnEvent = jest.fn()
    const anEvent = 'anEvent'
    sdk['ContractManagerEmitter'] = {
      on: mockOnEvent,
      once: mockOnceEvent,
      removeListener: mockRemoveEvent
    } as unknown as EventEmitter
    sdk['_connector'] = {
      _account: {} as Wallet,
      _provider: {
        emit: mockEmitEvent
      } as unknown as ethers.providers.JsonRpcProvider
    } as unknown as JsonRPCWeb3Connector

    const removeListener = sdk.addListener(anEvent, mockListenAnEvent)
    const removeListenerOn = sdk.on(anEvent, mockListenAnEvent)
    const removeListenerOnce = sdk.once(anEvent, mockListenAnEvent)
    removeListener()
    removeListenerOn()
    removeListenerOnce()

    expect(mockOnEvent).toHaveBeenNthCalledWith(1, anEvent, mockListenAnEvent)
    expect(mockOnEvent).toHaveBeenNthCalledWith(2, anEvent, mockListenAnEvent)
    expect(mockOnceEvent).toHaveBeenNthCalledWith(1, anEvent, mockListenAnEvent)
    expect(mockRemoveEvent).toHaveBeenNthCalledWith(
      1,
      anEvent,
      mockListenAnEvent
    )
    expect(mockRemoveEvent).toHaveBeenNthCalledWith(
      2,
      anEvent,
      mockListenAnEvent
    )
    expect(mockRemoveEvent).toHaveBeenNthCalledWith(
      3,
      anEvent,
      mockListenAnEvent
    )
  })

  it('should remove all listeners', () => {
    const sdk = new ContractManager()
    const mockRemoveAllEvents = jest.fn()
    const anEvent = 'anEvent'
    sdk['ContractManagerEmitter'] = {
      removeAllListeners: mockRemoveAllEvents
    } as unknown as EventEmitter

    sdk.removeAllListeners(anEvent)

    expect(mockRemoveAllEvents).toBeCalledWith(anEvent)
  })

  it('should remove the listener when calling the sdk remove listener or off', () => {
    const sdk = new ContractManager()
    const mockRemoveEvent = jest.fn()
    const mockListenAnEvent = jest.fn()
    const anEvent = 'anEvent'
    sdk['ContractManagerEmitter'] = {
      removeListener: mockRemoveEvent
    } as unknown as EventEmitter

    sdk.removeListener(anEvent, mockListenAnEvent)
    sdk.off(anEvent, mockListenAnEvent)

    expect(mockRemoveEvent).toHaveBeenNthCalledWith(
      1,
      anEvent,
      mockListenAnEvent
    )
    expect(mockRemoveEvent).toHaveBeenNthCalledWith(
      2,
      anEvent,
      mockListenAnEvent
    )
  })

  it('should handle the account changed event thrown by the provider', async () => {
    const sdk = new ContractManager()
    const provider = new ethers.providers.JsonRpcProvider()
    const signer = {} as Wallet
    const mockAccChanged = jest.fn()
    const connectorResponse = {
      account: undefined,
      provider: provider
    } as unknown as JsonRPCWeb3Connector
    jest.spyOn(ethers, 'Contract').mockImplementationOnce(() => {
      return {} as ethers.Contract
    })
    sdk['handleAccountChanged'] = mockAccChanged
    const mockGetConnector = jest.fn()
    sdk['selectConnector'] = mockGetConnector
    // "mock" activate to subscribe to provider events
    sdk['_connector'] = connectorResponse
    sdk['_isActive'] = true
    // manually setting the callback to the event since activate is "mocked"
    sdk['_connector']?.provider?.on(
      ProviderEvents.ACCOUNT_CHANGED,
      sdk['handleAccountChanged']
    )
    // setup promise to await for the emitted event
    const promise = new Promise<void>(resolve => {
      sdk['_connector']?.provider?.on(ProviderEvents.ACCOUNT_CHANGED, () => {
        resolve()
      })
    })
    // emit the event
    sdk['_connector']?.provider?.emit(ProviderEvents.ACCOUNT_CHANGED, signer)
    // await for the event to be emitted
    await promise
    expect(mockAccChanged).toHaveBeenCalledWith(signer)
  })

  it('should handle the chain changed event thrown by the provider', async () => {
    const sdk = new ContractManager()
    const chain = 'somechain'
    const mockEmitEvent = jest.fn()
    const provider = new ethers.providers.JsonRpcProvider()
    const connectorResponse = {
      account: undefined,
      provider: provider
    } as unknown as JsonRPCWeb3Connector
    const mockGetConnector = jest.fn()
    sdk['selectConnector'] = mockGetConnector
    sdk['_connector'] = connectorResponse
    sdk['ContractManagerEmitter'] = {
      emit: mockEmitEvent
    } as unknown as EventEmitter
    sdk['_connector']!.provider!.on(
      ProviderEvents.CHAIN_CHANGED,
      sdk['handleChainChanged']
    )
    // setup promise to await for the emitted event
    const promise = new Promise<void>(resolve => {
      sdk['_connector']?.provider?.on(ProviderEvents.CHAIN_CHANGED, () => {
        resolve()
      })
    })
    // emit the event
    sdk['_connector']?.provider?.emit(ProviderEvents.CHAIN_CHANGED, chain)
    // await for the event to be emitted
    await promise

    expect(mockEmitEvent).toBeCalledWith(ProviderEvents.CHAIN_CHANGED, chain)
  })

  it('should handle the disconnect event thrown by the provider', async () => {
    const sdk = new ContractManager()
    const disconnectError = {} as ProviderRpcError
    const mockEmitEvent = jest.fn()
    const mockDeactivate = jest.fn()
    const provider = new ethers.providers.JsonRpcProvider()
    const connectorResponse = {
      account: undefined,
      provider: provider
    } as unknown as JsonRPCWeb3Connector
    const mockGetConnector = jest.fn()
    sdk['selectConnector'] = mockGetConnector
    sdk['_connector'] = connectorResponse
    sdk['ContractManagerEmitter'] = {
      emit: mockEmitEvent
    } as unknown as EventEmitter
    sdk['deactivate'] = mockDeactivate
    // subscribe to provider events
    sdk['_connector']!.provider!.on(
      ProviderEvents.DISCONNECT,
      sdk['handleDisconnect']
    )
    // setup promise to await for the emitted event
    const promise = new Promise<void>(resolve => {
      sdk['_connector']?.provider?.on(ProviderEvents.DISCONNECT, () => {
        resolve()
      })
    })
    // emit the event
    sdk['_connector']?.provider?.emit(
      ProviderEvents.DISCONNECT,
      disconnectError
    )
    // await for the event to be emitted
    await promise

    expect(mockDeactivate).toBeCalled()
    expect(mockEmitEvent).toBeCalledWith(
      ProviderEvents.DISCONNECT,
      disconnectError
    )
  })

  it('should handle the connect event thrown by the provider', async () => {
    const sdk = new ContractManager()
    const connectInfo = {} as ConnectInfo
    const mockEmitEvent = jest.fn()
    const provider = new ethers.providers.JsonRpcProvider()
    const connectorResponse = {
      account: undefined,
      provider: provider
    } as unknown as JsonRPCWeb3Connector
    const mockGetConnector = jest.fn()
    sdk['selectConnector'] = mockGetConnector
    sdk['_connector'] = connectorResponse
    sdk['ContractManagerEmitter'] = {
      emit: mockEmitEvent
    } as unknown as EventEmitter
    // activate to subscribe to provider events
    sdk['_connector']!.provider!.on(
      ProviderEvents.CONNECT,
      sdk['handleConnect']
    )
    // setup promise to await for the emitted event
    const promise = new Promise<void>(resolve => {
      sdk['_connector']?.provider?.on(ProviderEvents.CONNECT, () => {
        resolve()
      })
    })
    // emit the event
    sdk['_connector']?.provider?.emit(ProviderEvents.CONNECT, connectInfo)
    // await for the event to be emitted
    await promise

    expect(mockEmitEvent).toBeCalledWith(ProviderEvents.CONNECT, connectInfo)
  })

  it('should not emit an event thrown by the provider when unsubscribed', async () => {
    const sdk = new ContractManager()
    const signer = {} as Signer
    const mockEmitEvent = jest.fn()
    const provider = new ethers.providers.JsonRpcProvider()
    const connectorResponse = {
      account: undefined,
      provider: provider
    } as unknown as JsonRPCWeb3Connector
    const mockGetConnector = jest.fn()
    sdk['selectConnector'] = mockGetConnector
    sdk['_connector'] = connectorResponse
    sdk['ContractManagerEmitter'] = {
      emit: mockEmitEvent
    } as unknown as EventEmitter
    sdk['_connector']?.provider?.removeAllListeners()
    // setup promise to await for the emitted event
    const promise = new Promise<void>(resolve => {
      sdk['_connector']?.provider?.on(ProviderEvents.ACCOUNT_CHANGED, () => {
        resolve()
      })
    })
    // emit the event
    sdk['_connector']?.provider?.emit(ProviderEvents.ACCOUNT_CHANGED, signer)
    // await for the event to be emitted
    await promise

    expect(mockEmitEvent).not.toBeCalled()
  })

  it('should subscribe to an event of the contract', async () => {
    const sdk = new ContractManager()
    sdk['_contract'] = Object.create(Contract.prototype) as Contract
    const mockOn = jest.fn()
    sdk['_contract'].on = mockOn
    jest
      .spyOn(FilterEvent.prototype, 'getEventOrFilter')
      .mockReturnValueOnce('Approval')
    const callback = jest.fn()
    sdk.subscribeToEvent('Approval', callback)
    expect(mockOn).toHaveBeenCalledWith('Approval', callback)
  })

  it('should unsubscribe to an event of the contract', async () => {
    const sdk = new ContractManager()
    sdk['_contract'] = Object.create(Contract.prototype) as Contract
    const mockOff = jest.fn()
    sdk['_contract'].off = mockOff
    jest
      .spyOn(FilterEvent.prototype, 'getEventOrFilter')
      .mockReturnValueOnce('Approval')
    const callback = jest.fn()
    sdk.unsubscribeToEvent('Approval', callback)
    expect(mockOff).toHaveBeenCalledWith('Approval', callback)
  })

  it('should return events that occurred between the given blocks', async () => {
    jest.spyOn(ContractManager.prototype, 'eventsBetweenBlocks')
    const sdk = new ContractManager()
    sdk['_contract'] = Object.create(Contract.prototype) as Contract
    jest.spyOn(FilterEvent.prototype, '_validate').mockReturnValueOnce()
    jest
      .spyOn(FilterEvent.prototype, '_getFilterForContract')
      .mockReturnValueOnce({} as EventFilter)
    const spyEventBlocks = jest
      .spyOn(Contract.prototype, 'queryFilter')
      .mockResolvedValueOnce([Object.create(Event.prototype) as Event])
    sdk.eventsBetweenBlocks('Approval', 1, 100)
    expect(spyEventBlocks).toHaveBeenCalledWith({}, 1, 100)
  })

  it('should return events that occurred between the given blocks and use the latest event in toBlock if no parameter', async () => {
    jest.spyOn(ContractManager.prototype, 'eventsBetweenBlocks')
    const sdk = new ContractManager()
    sdk['_contract'] = Object.create(Contract.prototype) as Contract
    jest.spyOn(FilterEvent.prototype, '_validate').mockReturnValueOnce()
    jest
      .spyOn(FilterEvent.prototype, '_getFilterForContract')
      .mockReturnValueOnce({} as EventFilter)
    const spyEventBlocks = jest
      .spyOn(Contract.prototype, 'queryFilter')
      .mockResolvedValueOnce([Object.create(Event.prototype) as Event])
    sdk.eventsBetweenBlocks('Approval', 1)
    expect(spyEventBlocks).toHaveBeenCalledWith({}, 1, 'latest')
  })
})
