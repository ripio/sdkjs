/* eslint-disable @typescript-eslint/no-explicit-any */
import { Contract, ethers, EventFilter } from 'ethers'
import {
  EventFragment,
  FunctionFragment,
  Interface,
  ParamType
} from 'ethers/lib/utils'
import { AbiItemTypes } from '../types/enums'
import errors from '../types/errors'
import { TransactionResponse, ValueInput } from '../types/interfaces'

/**
 * Throws an Error with the msg 'paramName is required'
 * @param {string} paramName name of the param
 * @throws {Error} Error with the msg 'paramName is required'
 */
export const isRequired = (paramName: string) => {
  throw errors.IS_REQUIRED(paramName)
}

/**
 * Throws an Error if param is null
 * @param {any} param param to check
 * @param {Error} error error to throw if param is null
 * @throws {Error} error provided
 */
export const requireParam = (params: Array<any> | any, error: Error) => {
  if (!(params instanceof Array)) params = [params]
  const some = params.some(
    (param: unknown) => param === undefined || param === null
  )
  if (some) throw error
}

/**
 * It takes a Solidity type and returns a TypeScript type
 * @param {string} type - The type of the parameter.
 * @returns A function that takes a string compares it against a string value
 * and returns an 'equivalent' type in javascript. Returns null if no match found.
 */
export const matchType = (type: string) => {
  // TODO complete with all use cases
  switch (true) {
    case 'address' === type:
      return 'string'
    case type.includes('int'):
      return 'number'
    case type === 'bool':
      return 'boolean'
    case type.includes('fixed'):
      return 'float'
    default:
      return null
  }
}

/**
 * Checks if the value is a big number
 * @param {any} value - The value to check.
 * @returns It returns true if the value can be converted to a BigNumber, and false otherwise
 */
export const isBigNumber = (value: any) => {
  try {
    ethers.BigNumber.from(value)
  } catch {
    return false
  }
  return true
}

/**
 * Checks if the provided string is a float number.
 * @param {string} value - The value to be tested.
 * @returns It returns true if the value is a float number, otherwise it returns false
 */
export const isFloatNumber = (value: string) => {
  const regex = /^([0-9]*[.])?[0-9]+$/
  return regex.test(value)
}

export class FilterEvent {
  event: string
  values: Array<ValueInput> | null

  constructor(event: string, values: Array<ValueInput> | null = null) {
    this.event = event
    this.values = values // values to filter by
  }

  /**
   * It gets the event from the contract interface, and throws an error if it can't find it
   * @param {Interface} contractInterface - Interface - the contract interface
   * @returns The event object
   */
  _getEvent(contractInterface: Interface): EventFragment {
    let event
    try {
      event = contractInterface.getEvent(this.event)
    } catch (e: any) {
      if (e.reason === 'multiple matching events') {
        if (!this.values)
          throw errors.MISSING_PARAM(
            'to match with event that have same name, provide event name with params like this: myEvent(param1Type,param2Type)'
          )
      }
      throw errors.INVALID_EVENT(this.event)
    }
    return event
  }

  /**
   * It validates that the event parameters are valid and the event exists in contract
   * @param {Interface} contractInterface - The ABI of the contract.
   */
  _validate(contractInterface: Interface): void {
    const ev = this._getEvent(contractInterface)
    if (this.values)
      this.values.forEach(v => {
        const param = ev.inputs.find(
          (input: ParamType) => input.name === v.name
        )
        if (!param || !(matchType(param.type) === typeof v.value)) {
          throw errors.INVALID_EVENT_PARAMETER(v.name)
        }
      })
  }

  /**
   * It takes a contract, finds the event in the contract's interface, finds the values for the event's
   * inputs in the order the event has them, and returns an event filter for the event with the parameters.
   * @param {Contract} contract - Contract - this is the contract that we're getting the filter for.
   * @returns The filter for the contract.
   */
  _getFilterForContract(contract: Contract): EventFilter {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const inputs = this._getEvent(contract.interface).inputs
    const valuesInOrder = inputs.map(
      (i: ParamType) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        Object.values(this.values!).find(
          (input: ValueInput) => input.name === i.name
        )?.value || null
    )
    return contract.filters[this.event](...valuesInOrder)
  }

  /**
   * If the user has provided values, we return a filter for the contract, otherwise we return the
   * event
   * @param {Contract} contract - Contract - The contract object that you're using to get the event
   * from.
   * @returns The event or filter for the contract.
   */
  getEventOrFilter(contract: Contract): string | EventFilter {
    this._validate(contract.interface)
    if (this.values) return this._getFilterForContract(contract)
    return this.event
  }
}

/**
 * It returns true if the object has all the properties of a TransactionResponse
 * (it only checks for required properties)
 * @param {any} object - The object to check.
 * @returns A function that takes an object and returns a boolean.
 */
export const isTransactionResponse = (obj: any): obj is TransactionResponse => {
  if (typeof obj !== 'object' || obj === null || obj === undefined) return false
  return (
    'nonce' in obj &&
    'gasLimit' in obj &&
    'gasPrice' in obj &&
    'value' in obj &&
    'data' in obj &&
    'from' in obj &&
    'chainId' in obj &&
    'hash' in obj &&
    'wait' in obj
  )
}

/**
 * It validates that an ABI matches the ABI of the standard
 * @param {any} standard - the standard ABI
 * @param {Interface} abi - Interface - the abi to validate
 */
export const validateAbi = (standard: any, abi: Interface): void => {
  const iStandard = new ethers.utils.Interface(standard)
  const errorsToThrow: Array<Error> = []

  // validate functions
  Object.keys(iStandard.functions).forEach((functionName: string) => {
    let iFunction = undefined
    try {
      // attempts to get function from abi
      iFunction = abi.getFunction(functionName)
    } catch (error) {
      errorsToThrow.push(
        errors.ABI_ITEM_NOT_FOUND(functionName, AbiItemTypes.FUNCTION)
      )
    }
    if (iFunction) {
      const iFunctionStandard = iStandard.getFunction(functionName)
      validateInputs(
        iFunctionStandard,
        iFunction,
        errorsToThrow,
        functionName,
        AbiItemTypes.FUNCTION
      )
      validateOutputs(
        iFunctionStandard,
        iFunction,
        errorsToThrow,
        functionName,
        AbiItemTypes.FUNCTION
      )
    }
  })

  // validate events
  Object.keys(iStandard.events).forEach((eventName: string) => {
    let iEvent = undefined
    try {
      // attempts to get event from abi
      iEvent = abi.getEvent(eventName)
    } catch (error) {
      errorsToThrow.push(
        errors.ABI_ITEM_NOT_FOUND(eventName, AbiItemTypes.EVENT)
      )
    }
    if (iEvent) {
      const iEventStandard = iStandard.getEvent(eventName)
      validateInputs(
        iEventStandard,
        iEvent,
        errorsToThrow,
        eventName,
        AbiItemTypes.EVENT
      )
    }
  })

  if (errorsToThrow.length) throw errorsToThrow
}

/**
 * It validates the inputs and outputs of a function
 * @param {ParamType[] | undefined} paramStandard - The standard ABI item's input/output parameters
 * @param {ParamType[] | undefined} paramsAbi - The ABI parameters
 * @param {Error[]} errorsToThrow - An array of errors that will be thrown at the end of the function.
 * @param {string} itemName - The name of the ABI item (e.g. "transfer")
 * @param {AbiItemTypes} itemType - AbiItemTypes
 */
export const validateIO = (
  paramStandard: ParamType[] | undefined,
  paramsAbi: ParamType[] | undefined,
  errorsToThrow: Error[],
  itemName: string,
  itemType: AbiItemTypes,
  ioType: 'input' | 'output'
) => {
  // number of inputs/outputs is different
  if (paramStandard?.length !== paramsAbi?.length) {
    errorsToThrow.push(
      errors.ABI_ITEM_IO_LENGTH_MISMATCH(itemName, itemType, ioType)
    )
  }
  // number of inputs/outputs is the same
  else {
    const abiIOTypes = paramsAbi?.map(io => io.type)
    const standardIOTypes = paramStandard?.map(io => io.type)

    // types are different
    if (JSON.stringify(abiIOTypes) !== JSON.stringify(standardIOTypes)) {
      errorsToThrow.push(
        errors.ABI_ITEM_IO_TYPES_MISMATCH(itemName, itemType, ioType)
      )
    }
  }
}

/**
 * It validates that the inputs of the standard item and the provided abi item are the same
 * @param {FunctionFragment | EventFragment} itemStandard - the standard item
 * @param {FunctionFragment | EventFragment} itemAbi - the item from the provided ABI
 * @param {Error[]} errorsToThrow - an array to push errors to
 * @param {string} itemName - The name of the item (function or event) being validated.
 * @param {AbiItemTypes} itemType - The type of the ABI item
 */
export const validateInputs = (
  itemStandard: FunctionFragment | EventFragment,
  itemAbi: FunctionFragment | EventFragment,
  errorsToThrow: Error[],
  itemName: string,
  itemType: AbiItemTypes
) => {
  validateIO(
    itemStandard.inputs,
    itemAbi.inputs,
    errorsToThrow,
    itemName,
    itemType,
    'input'
  )
}

/**
 * It validates that the outputs of the standard item and the provided abi item are the same
 * @param {FunctionFragment} itemStandard - the standard item
 * @param {FunctionFragment} itemAbi - the item from the provided ABI
 * @param {Error[]} errorsToThrow - An array of errors that will be thrown if the validation fails.
 * @param {string} itemName - The name of the item (function or event) being validated.
 * @param {AbiItemTypes} itemType - The type of the ABI item
 */
export const validateOutputs = (
  itemStandard: FunctionFragment,
  itemAbi: FunctionFragment,
  errorsToThrow: Error[],
  itemName: string,
  itemType: AbiItemTypes
) => {
  validateIO(
    itemStandard.outputs,
    itemAbi.outputs,
    errorsToThrow,
    itemName,
    itemType,
    'output'
  )
}
