import { TransactionResponse } from '@ethersproject/providers'
import { ethers, BigNumber } from 'ethers'
import { UnitTypes } from '../types/enums'
import { formatFixed, parseFixed } from '@ethersproject/bignumber'
import {
  ConnectorResponseExtended,
  ExecuteResponse,
  TransactionResponseExtended
} from '../types/interfaces'
import AbstractWeb3Connector from '../connectors/AbstractWeb3Connector'
import errors from '../types/errors'
import { isTransactionResponse } from './validations'
import { ContractManager } from '../managers'

/**
 * It takes a value and a unit and returns a string
 * @param {ethers.BigNumberish} value - The value to be converted.
 * @param {UnitTypes} unit - UnitTypes
 * @returns A string
 */
export function fromWei(value: ethers.BigNumberish, unit: UnitTypes): string {
  return formatFixed(value, unit)
}

/**
 * It converts a string value representing X type unit into wei (in BigNumber).
 * @param {string} value - The value to convert.
 * @param {UnitTypes} unit - The unit of the value.
 * @returns A BigNumber
 */
export function toWei(
  value: string,
  unit: UnitTypes = UnitTypes.ETHER
): BigNumber {
  return parseFixed(value, unit)
}

/**
 * It converts a number to a hex string
 * @param {number} num - The number to convert to hex.
 * @returns A hex string
 */
export function numberToHex(num: number): string {
  const bn = BigNumber.from(num)
  return bn.toHexString()
}

/**
 * It takes a hexadecimal string and returns a number
 * @param {string} hex - The hexadecimal string to convert to a number.
 * @returns A number
 */
export function hexToNumber(hex: string): number {
  return parseInt(hex, 16)
}

/**
 * It takes a transaction response and returns a transaction response with additional methods
 * @param {TransactionResponse} tx - The transaction response object.
 * @param {AbstractWeb3Connector} connector - AbstractWeb3Connector
 * @param {ContractManager} manager - The contract's class.
 * @returns A transaction response extended object.
 */
export function extendTransactionResponse(
  tx: TransactionResponse,
  connector: AbstractWeb3Connector,
  manager: ContractManager
): TransactionResponseExtended {
  if (!connector.isActive) throw errors.MUST_ACTIVATE
  return {
    ...tx,
    cancel: (gasSpeed?: BigNumber) => connector.cancelTransaction(tx, gasSpeed),
    speedUp: (gasSpeed?: BigNumber) =>
      connector.speedUpTransaction(tx, gasSpeed),
    change: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      newParams: Record<string, any>,
      gasSpeed?: BigNumber
    ) => manager.changeTransaction(tx, newParams, gasSpeed)
  }
}

export function connectorResponse(
  tx: TransactionResponse,
  connector: AbstractWeb3Connector
): ConnectorResponseExtended {
  if (!connector.isActive) throw errors.MUST_ACTIVATE
  return {
    ...tx,
    cancel: (gasSpeed?: BigNumber) => connector.cancelTransaction(tx, gasSpeed),
    speedUp: (gasSpeed?: BigNumber) =>
      connector.speedUpTransaction(tx, gasSpeed),
    change: (to?: string, value?: BigNumber, gasSpeed?: BigNumber) =>
      connector.changeBalanceTransaction(tx, to, value, gasSpeed)
  }
}

/**
 * It takes a transaction response or a value and returns an ExecuteResponse
 * @param {any} tx - The transaction response object or value.
 * @param {AbstractWeb3Connector} connector - AbstractWeb3Connector
 * @param {ContractManager} manager - The contract's class.
 * @returns An ExecuteResponse object.
 */
export function getExecuteResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  connector: AbstractWeb3Connector,
  manager: ContractManager
): ExecuteResponse {
  if (isTransactionResponse(tx)) {
    return {
      transactionResponse: extendTransactionResponse(tx, connector, manager),
      isTransaction: true
    }
  } else {
    return { value: tx, isTransaction: false }
  }
}
