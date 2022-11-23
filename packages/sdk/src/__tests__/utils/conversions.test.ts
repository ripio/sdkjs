/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  fromWei,
  hexToNumber,
  numberToHex,
  toWei,
  extendTransactionResponse,
  getExecuteResponse,
  connectorResponse
} from '../../utils/conversions'
import { UnitTypes } from '../../types/enums'
import { BigNumber } from 'ethers'
import AbstractWeb3Connector from '../../connectors/AbstractWeb3Connector'
import { TransactionResponse } from '../../types/interfaces'
import { validations } from '../../utils'
import { ContractManager } from '../../managers'
import errorTypes from '../../types/errors'

describe('Test convert functions', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Should convert from wei to ether', () => {
    const value = fromWei(1, UnitTypes.ETHER)
    expect(value).toBe('0.000000000000000001')
  })

  it('Should convert to wei from gwei', () => {
    const value = toWei('1000000000', UnitTypes.GWEI)
    const bn = BigNumber.from('1000000000000000000')
    expect(value).toStrictEqual(bn)
  })

  it('Should convert to wei from ether by default', () => {
    const value = toWei('1')
    const bn = BigNumber.from('1000000000000000000')
    expect(value).toStrictEqual(bn)
  })

  it('Should convert from positive number to hexadecimal string', () => {
    const value = numberToHex(1)
    const value2 = numberToHex(100)
    expect(value).toBe('0x01')
    expect(value2).toBe('0x64')
  })

  it('Should convert from negative number to hexadecimal string', () => {
    const value = numberToHex(-1)
    const value2 = numberToHex(-100)
    expect(value).toBe('-0x01')
    expect(value2).toBe('-0x64')
  })

  it('Should convert from positive hexadecimal string to number', () => {
    const value = hexToNumber('0x1')
    const value2 = hexToNumber('0x0000001')
    expect(value).toBe(1)
    expect(value2).toBe(1)
  })

  it('Should convert from negative hexadecimal string to number', () => {
    const value = hexToNumber('-0x1')
    const value2 = hexToNumber('-0x0000001')
    expect(value).toBe(-1)
    expect(value2).toBe(-1)
  })

  it('Should extend a transaction response', () => {
    const tx = { wait: jest.fn() } as unknown as TransactionResponse
    const connector = {
      isActive: true,
      getMinConfirmations: jest.fn(() => 1)
    } as unknown as AbstractWeb3Connector
    const manager = {} as unknown as ContractManager
    const extended = extendTransactionResponse(tx, connector, manager)
    expect(extended).toHaveProperty('cancel')
    expect(extended).toHaveProperty('speedUp')
  })

  it('Should call cancelTransaction when executing the cancel method of TransactionResponseExtended', () => {
    const tx = { cancel: jest.fn() } as unknown as TransactionResponse
    const gasSpeed = BigNumber.from(1)
    const connector = {
      isActive: true,
      cancelTransaction: jest.fn()
    } as unknown as AbstractWeb3Connector
    const manager = {} as unknown as ContractManager
    const extended = extendTransactionResponse(tx, connector, manager)
    extended.cancel()
    extended.cancel(gasSpeed)
    expect(connector.cancelTransaction).toHaveBeenCalledTimes(2)
    expect(connector.cancelTransaction).toHaveBeenNthCalledWith(
      1,
      tx,
      undefined
    )
    expect(connector.cancelTransaction).toHaveBeenNthCalledWith(2, tx, gasSpeed)
  })

  it('Should call speedUpTransaction when executing the speedUp method of TransactionResponseExtended', () => {
    const tx = { speedUp: jest.fn() } as unknown as TransactionResponse
    const gasSpeed = BigNumber.from(1)
    const connector = {
      isActive: true,
      speedUpTransaction: jest.fn()
    } as unknown as AbstractWeb3Connector
    const manager = {} as unknown as ContractManager
    const extended = extendTransactionResponse(tx, connector, manager)
    extended.speedUp()
    extended.speedUp(gasSpeed)
    expect(connector.speedUpTransaction).toHaveBeenCalledTimes(2)
    expect(connector.speedUpTransaction).toHaveBeenNthCalledWith(
      1,
      tx,
      undefined
    )
    expect(connector.speedUpTransaction).toHaveBeenNthCalledWith(
      2,
      tx,
      gasSpeed
    )
  })

  it('Should call changeTransaction when executing the change method of TransactionResponseExtended', () => {
    const tx = { change: jest.fn() } as unknown as TransactionResponse
    const connector = {
      isActive: true
    } as unknown as AbstractWeb3Connector
    const manager = {
      changeTransaction: jest.fn()
    } as unknown as ContractManager
    const extended = extendTransactionResponse(tx, connector, manager)
    extended.change!({})
    expect(manager.changeTransaction).toBeCalledWith(tx, {}, undefined)
  })

  it('Should call changeTransaction when executing the change method of TransactionResponseExtended', () => {
    const tx = { change: jest.fn() } as unknown as TransactionResponse
    const connector = {
      isActive: true
    } as unknown as AbstractWeb3Connector
    const manager = {
      changeTransaction: jest.fn()
    } as unknown as ContractManager
    const extended = extendTransactionResponse(tx, connector, manager)
    expect(extended).toHaveProperty('change')
    extended.change!({})
    expect(manager.changeTransaction).toBeCalledWith(tx, {}, undefined)
  })

  it('Should call changeTransaction when executing the change method with params of TransactionResponseExtended', () => {
    const tx = { change: jest.fn() } as unknown as TransactionResponse
    const connector = {
      isActive: true,
      changeTransaction: jest.fn()
    } as unknown as AbstractWeb3Connector
    const manager = {
      changeTransaction: jest.fn()
    } as unknown as ContractManager
    const extended = extendTransactionResponse(tx, connector, manager)
    expect(extended).toHaveProperty('change')
    extended.change!({}, BigNumber.from('10'))
    expect(manager.changeTransaction).toBeCalledWith(
      tx,
      {},
      BigNumber.from('10')
    )
  })

  it('Should throw an error if the connector is not active', () => {
    const tx = { wait: jest.fn() } as unknown as TransactionResponse
    const connector = {
      isActive: false,
      getMinConfirmations: jest.fn(() => 1)
    } as unknown as AbstractWeb3Connector
    const manager = {} as unknown as ContractManager
    expect(() => extendTransactionResponse(tx, connector, manager)).toThrow()
  })

  it('Should return an ExecuteResponse with a transactionResponse', () => {
    const tx = { wait: () => jest.fn() } as unknown as TransactionResponse
    const connector = {
      isActive: true,
      getMinConfirmations: jest.fn(() => 1)
    } as unknown as AbstractWeb3Connector
    const manager = {} as unknown as ContractManager
    const mockIsTR = jest
      .spyOn(validations, 'isTransactionResponse')
      .mockReturnValueOnce(true)
    const executeResponse = getExecuteResponse(tx, connector, manager)
    expect(executeResponse).toHaveProperty('transactionResponse')
    expect(executeResponse).not.toHaveProperty('value')
    expect(executeResponse.transactionResponse?.cancel).toBeDefined()
    expect(executeResponse.transactionResponse?.change).toBeDefined()
    expect(executeResponse.transactionResponse?.speedUp).toBeDefined()
    expect(executeResponse.transactionResponse?.wait).toBeDefined()
    expect(executeResponse.isTransaction).toBe(true)
    expect(mockIsTR).toBeCalledWith(tx)
  })

  it('Should return an ExecuteResponse with a value', () => {
    const tx = 123
    const connector = {
      isActive: true,
      getMinConfirmations: jest.fn(() => 1)
    } as unknown as AbstractWeb3Connector
    const manager = {} as unknown as ContractManager
    const mockIsTR = jest
      .spyOn(validations, 'isTransactionResponse')
      .mockReturnValueOnce(false)
    const executeResponse = getExecuteResponse(tx, connector, manager)
    expect(mockIsTR).toBeCalledWith(tx)
    expect(executeResponse).not.toHaveProperty('transactionResponse')
    expect(executeResponse).toHaveProperty('value')
    expect(executeResponse.value).toEqual(tx)
    expect(executeResponse.isTransaction).toBe(false)
  })

  it('Should extend a transaction response', () => {
    const tx = { wait: jest.fn() } as unknown as TransactionResponse
    const connector = {
      isActive: true,
      getMinConfirmations: jest.fn(() => 1)
    } as unknown as AbstractWeb3Connector
    const extended = connectorResponse(tx, connector)
    expect(extended).toHaveProperty('cancel')
    expect(extended).toHaveProperty('speedUp')
    expect(extended).toHaveProperty('change')
  })

  it('Should call cancelTransaction when executing the cancel method of ConnectorResponseExtended', () => {
    const tx = {
      from: '0x004',
      to: '0x003',
      value: BigNumber.from('1')
    } as unknown as TransactionResponse
    const gasSpeed = BigNumber.from(1)
    const connector = {
      isActive: true,
      cancelTransaction: jest.fn()
    } as unknown as AbstractWeb3Connector
    const extended = connectorResponse(tx, connector)
    extended.cancel()
    extended.cancel(gasSpeed)
    expect(connector.cancelTransaction).toHaveBeenCalledTimes(2)
    expect(connector.cancelTransaction).toHaveBeenNthCalledWith(
      1,
      tx,
      undefined
    )
    expect(connector.cancelTransaction).toHaveBeenNthCalledWith(2, tx, gasSpeed)
  })

  it('Should call speedUpTransaction when executing the speedUp method of ConnectorResponseExtended', () => {
    const tx = {
      from: '0x004',
      to: '0x003',
      value: BigNumber.from('1')
    } as unknown as TransactionResponse
    const gasSpeed = BigNumber.from(1)
    const connector = {
      isActive: true,
      speedUpTransaction: jest.fn()
    } as unknown as AbstractWeb3Connector
    const extended = connectorResponse(tx, connector)
    extended.speedUp()
    extended.speedUp(gasSpeed)
    expect(connector.speedUpTransaction).toHaveBeenCalledTimes(2)
    expect(connector.speedUpTransaction).toHaveBeenNthCalledWith(
      1,
      tx,
      undefined
    )
    expect(connector.speedUpTransaction).toHaveBeenNthCalledWith(
      2,
      tx,
      gasSpeed
    )
  })

  it('Should call changeTransaction when executing the change method of ConnectorResponseExtended', () => {
    const tx = {
      from: '0x004',
      to: '0x003',
      value: BigNumber.from('1')
    } as unknown as TransactionResponse
    const connector = {
      isActive: true,
      changeBalanceTransaction: jest.fn()
    } as unknown as AbstractWeb3Connector
    const extended = connectorResponse(tx, connector)
    extended.change!()
    expect(connector.changeBalanceTransaction).toBeCalledWith(
      tx,
      undefined,
      undefined,
      undefined
    )
  })

  it('Should call changeTransaction when executing the change method of ConnectorResponseExtended with "to" value', () => {
    const tx = {
      from: '0x004',
      to: '0x003',
      value: BigNumber.from('1')
    } as unknown as TransactionResponse
    const to = '0x001'
    const connector = {
      isActive: true,
      changeBalanceTransaction: jest.fn()
    } as unknown as AbstractWeb3Connector
    const extended = connectorResponse(tx, connector)
    expect(extended).toHaveProperty('change')
    extended.change!(to)
    expect(connector.changeBalanceTransaction).toBeCalledWith(
      tx,
      to,
      undefined,
      undefined
    )
  })

  it('Should call changeTransaction when executing the change method with "value" param', () => {
    const tx = {
      from: '0x004',
      to: '0x003',
      value: BigNumber.from('1')
    } as unknown as TransactionResponse
    const value = BigNumber.from('2')
    const connector = {
      isActive: true,
      changeBalanceTransaction: jest.fn()
    } as unknown as AbstractWeb3Connector
    const extended = connectorResponse(tx, connector)
    expect(extended).toHaveProperty('change')
    extended.change!(undefined, value)
    expect(connector.changeBalanceTransaction).toBeCalledWith(
      tx,
      undefined,
      value,
      undefined
    )
  })

  it('Should call changeTransaction when executing the change method with "speedUp" param', () => {
    const tx = {
      from: '0x004',
      to: '0x003',
      value: BigNumber.from('1')
    } as unknown as TransactionResponse
    const to = '0x005'
    const value = BigNumber.from('2')
    const speed = BigNumber.from('2')
    const connector = {
      isActive: true,
      changeBalanceTransaction: jest.fn()
    } as unknown as AbstractWeb3Connector
    const extended = connectorResponse(tx, connector)
    expect(extended).toHaveProperty('change')
    extended.change!(to, value, speed)
    expect(connector.changeBalanceTransaction).toBeCalledWith(
      tx,
      to,
      value,
      speed
    )
  })

  it('Should throw an error if the connector is not active', () => {
    const tx = { wait: jest.fn() } as unknown as TransactionResponse
    const connector = {
      isActive: false
    } as unknown as AbstractWeb3Connector
    expect(() => connectorResponse(tx, connector)).toThrow(
      errorTypes.MUST_ACTIVATE
    )
  })
})
