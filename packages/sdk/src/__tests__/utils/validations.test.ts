import { Contract, ethers, EventFilter } from 'ethers'
import { EventFragment, Interface, ParamType } from 'ethers/lib/utils'
import { AbiItemTypes } from '../../types/enums'
import errors from '../../types/errors'
import * as validations from '../../utils/validations'
import {
  isRequired,
  matchType,
  requireParam,
  isBigNumber,
  FilterEvent,
  isTransactionResponse,
  validateInputs,
  validateOutputs,
  validateAbi,
  validateIO,
  isFloatNumber,
  implementsFunction
} from '../../utils/validations'

const standard = [
  {
    inputs: [
      {
        name: 'owner',
        type: 'address'
      },
      {
        name: 'spender',
        type: 'address'
      }
    ],
    name: 'Approval',
    type: 'event'
  },
  {
    inputs: [
      {
        name: 'owner',
        type: 'address'
      },
      {
        name: 'spender',
        type: 'address'
      }
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]

describe('isRequired', () => {
  it('Should throw an error according the param', () => {
    expect(() => {
      isRequired('paramName')
    }).toThrow(errors.IS_REQUIRED('paramName'))
  })
})

describe('isFloatNumber', () => {
  it('Should pass if the param is a float number', () => {
    expect(isFloatNumber('0.1')).toBe(true)
  })

  it('Should return false if param is not a float number', () => {
    expect(isFloatNumber('0.1.1')).toBe(false)
  })
})

describe('requireParam', () => {
  it('Should throw an error if the param is null', () => {
    expect(() => {
      requireParam(null, errors.IS_REQUIRED('param'))
    }).toThrow(errors.IS_REQUIRED('param'))
  })
  it('Should not throw an error if the param is not null', () => {
    expect(() => {
      requireParam('param', errors.IS_REQUIRED('param'))
    }).not.toThrow()
  })
})

describe('matchType', () => {
  it('Should return null if the param is not the expected type', () => {
    expect(matchType('unexpectedType')).toBeNull()
  })
  it('Should return string if type is address', () => {
    const result = matchType('address')
    expect(result).toBe('string')
  })
  it('Should return number if type is (u)intx', () => {
    const result = matchType('uint256')
    const result2 = matchType('uint8')
    const result3 = matchType('int256')
    const result4 = matchType('int8')
    expect(result).toBe('number')
    expect(result2).toBe('number')
    expect(result3).toBe('number')
    expect(result4).toBe('number')
  })
  it('Should return boolean if type is bool', () => {
    const result = matchType('bool')
    expect(result).toBe('boolean')
  })
  it('Should return float if type is (u)fixed', () => {
    const result = matchType('fixed8')
    const result2 = matchType('fixed256')
    const result3 = matchType('ufixed8')
    const result4 = matchType('ufixed256')
    expect(result).toBe('float')
    expect(result2).toBe('float')
    expect(result3).toBe('float')
    expect(result4).toBe('float')
  })
})

describe('isBigNumber', () => {
  it('Should return true if a numeric string is passed', () => {
    expect(isBigNumber('1000000000')).toBe(true)
  })
  it('Should return true if a number is passed', () => {
    expect(isBigNumber(1000000000)).toBe(true)
  })
  it('Should return true if a hexadecimal is passed', () => {
    expect(isBigNumber('0x17f609e449')).toBe(true)
    expect(isBigNumber(0x17f609e449)).toBe(true)
  })
  it('Should return false if an invalid value is passed', () => {
    expect(isBigNumber('asdasdsadsd')).toBe(false)
    expect(isBigNumber(false)).toBe(false)
  })
})

describe('FilterEvent', () => {
  it('Should create a FilterEvent object with its attributes', () => {
    let filter = new FilterEvent('evt')
    expect(filter.event).toBe('evt')
    expect(filter.values).toBe(null)
    filter = new FilterEvent('evt', [{ name: 'v1', value: 1 }])
    expect(filter.event).toBe('evt')
    expect(filter.values).toEqual([{ name: 'v1', value: 1 }])
  })

  it("Should get a contract's event", () => {
    const event = {} as EventFragment
    const filter = new FilterEvent('evt')
    const contractInterface = {
      events: {
        'Approval(address,address,uint256)': {
          name: 'Approval',
          inputs: [{ name: 'address', type: 'address' } as unknown as ParamType]
        }
      },
      getEvent: () => {
        return event
      }
    } as unknown as Interface
    expect(filter._getEvent(contractInterface)).toEqual(event)
  })

  it('Should throw missing param error if the contract has multiple events with the same name and no params where provided', () => {
    class CustomError extends Error {
      reason: string | undefined
      constructor(message: string | undefined, reason: string | undefined) {
        super(message)
        this.reason = reason
      }
    }
    const filter = new FilterEvent('evt')
    const contractInterface = {
      events: {
        'Approval(address,address,uint256)': {
          name: 'Approval',
          inputs: [
            { name: 'address', type: 'address' } as unknown as ParamType,
            { name: 'address', type: 'address' } as unknown as ParamType,
            { name: 'value', type: 'uint256' } as unknown as ParamType
          ]
        },
        'Approval(address)': {
          name: 'Approval',
          inputs: [{ name: 'address', type: 'address' } as unknown as ParamType]
        }
      },
      getEvent: () => {
        throw new CustomError('...', 'multiple matching events')
      }
    } as unknown as Interface
    expect(() => filter._getEvent(contractInterface)).toThrow(
      errors.MISSING_PARAM(
        'to match with event that have same name, provide event name with params like this: myEvent(param1Type,param2Type)'
      )
    )
  })

  it('Should throw invalid event error if event is not found in contracts interface', () => {
    const filter = new FilterEvent('evt')
    const contractInterface = {
      events: {
        'Approval(address,address,uint256)': {
          name: 'Approval',
          inputs: [{ name: 'address', type: 'address' } as unknown as ParamType]
        }
      },
      getEvent: () => {
        throw new Error('...')
      }
    } as unknown as Interface
    expect(() => filter._getEvent(contractInterface)).toThrow(
      errors.INVALID_EVENT('evt')
    )
  })

  it("Should validate that event exists in contract's interface and so every value and its type", () => {
    const mockGetEvent = jest
      .spyOn(FilterEvent.prototype, '_getEvent')
      .mockReturnValue({
        inputs: [{ name: 'owner', type: 'address' } as ParamType]
      } as EventFragment)
    const contractInterface = {
      events: {
        'Approval(address,address,uint256)': {
          name: 'Approval',
          inputs: [{ name: 'owner', type: 'address' } as unknown as ParamType]
        }
      }
    } as unknown as Interface
    const filter = new FilterEvent('Approval', [
      { name: 'owner', value: '0x0001' }
    ])
    filter._validate(contractInterface)
    expect(mockGetEvent).toHaveBeenCalledTimes(1)
  })

  it('Should throw an error when validating an event that does not exists in contract', () => {
    jest.spyOn(FilterEvent.prototype, '_getEvent').mockImplementation(() => {
      throw errors.INVALID_EVENT('fake-evt')
    })
    const contractInterface = {} as unknown as Interface
    const filter = new FilterEvent('fake-evt')
    expect(() => filter._validate(contractInterface)).toThrow(
      errors.INVALID_EVENT('fake-evt')
    )
  })

  it('Should throw an error when validating values that does not exists in contract', () => {
    jest.spyOn(FilterEvent.prototype, '_getEvent').mockReturnValue({
      inputs: [{ name: 'owner', type: 'address' } as ParamType]
    } as EventFragment)
    const contractInterface = {} as unknown as Interface
    const filter = new FilterEvent('Approval', [
      { name: 'bad-value', value: 1 }
    ])
    expect(() => filter._validate(contractInterface)).toThrow(
      errors.INVALID_EVENT_PARAMETER('bad-value')
    )
  })

  it('Should throw an error when validating values and type does not match', () => {
    jest.spyOn(FilterEvent.prototype, '_getEvent').mockReturnValue({
      inputs: [{ name: 'owner', type: 'address' } as ParamType]
    } as EventFragment)
    const contractInterface = {} as unknown as Interface
    const filter = new FilterEvent('Approval', [{ name: 'owner', value: 1 }])
    expect(() => filter._validate(contractInterface)).toThrow(
      errors.INVALID_EVENT_PARAMETER('owner')
    )
  })

  it('Should return a contract event filter', () => {
    jest.spyOn(FilterEvent.prototype, '_getEvent').mockReturnValue({
      inputs: [
        { name: 'owner', type: 'address' } as ParamType,
        { name: 'to', type: 'address' } as ParamType,
        { name: 'value', type: 'uint256' } as ParamType
      ]
    } as EventFragment)
    // in filter, params are passed out of order
    const filter = new FilterEvent('Approval', [
      { name: 'to', value: '0x0002' },
      { name: 'owner', value: '0x0001' }
    ])
    const mockFilters = jest.fn().mockReturnValueOnce({} as EventFilter)
    const contract = {
      interface: [{}] as unknown as Interface,
      filters: { Approval: mockFilters }
    } as unknown as Contract
    // const mockFilters = jest.spyOn(Contract.prototype, 'Approval').mockReturnValueOnce({} as EventFilter)
    const contractFilter = filter._getFilterForContract(contract)
    // contract.filters is called with params in the same order that getEvent returns them, params not provided are asigned as null
    expect(mockFilters).toHaveBeenCalledWith('0x0001', '0x0002', null)
    expect(contractFilter).toEqual({})
  })

  it("Should return a string with event name if contract is valid and there's no values", () => {
    const spyValidate = jest
      .spyOn(FilterEvent.prototype, '_validate')
      .mockImplementationOnce(() => {})
    const spyGetFilter = jest.spyOn(
      FilterEvent.prototype,
      '_getFilterForContract'
    )
    const filter = new FilterEvent('Approval')
    const contract = { interface: {} } as Contract
    const event = filter.getEventOrFilter(contract)
    expect(spyValidate).toHaveBeenCalledTimes(1)
    expect(spyGetFilter).not.toHaveBeenCalled()
    expect(typeof event).toBe('string')
  })

  it("Should return an EventFilter if contract is valid and there's values", () => {
    const spyValidate = jest
      .spyOn(FilterEvent.prototype, '_validate')
      .mockImplementationOnce(() => {})
    const spyGetFilter = jest
      .spyOn(FilterEvent.prototype, '_getFilterForContract')
      .mockReturnValueOnce({} as EventFilter)
    const filter = new FilterEvent('Approval', [{ name: 'value', value: 1 }])
    const contract = { interface: {} } as Contract
    const event = filter.getEventOrFilter(contract)
    expect(spyValidate).toHaveBeenCalledTimes(1)
    expect(spyGetFilter).toHaveBeenCalledTimes(1)
    expect(event).toEqual({})
  })
})

describe('isTransactionResponse', () => {
  it('Should return true if response is a transactionResponse object', () => {
    const response = {
      nonce: '',
      gasLimit: '',
      gasPrice: '',
      value: '',
      data: '',
      from: '',
      chainId: '',
      hash: '',
      wait: '',
      confirmations: ''
    }
    expect(isTransactionResponse(response)).toBe(true)
  })

  it('Should return false if response is not a transactionResponse object', () => {
    const response = {
      status: 'success',
      transactionHash: '0x0001'
    }
    expect(isTransactionResponse(response)).toBe(false)
  })

  it('Should return false if response is not of type object', () => {
    expect(isTransactionResponse('0x0001')).toBe(false)
    expect(isTransactionResponse(1)).toBe(false)
    expect(isTransactionResponse(null)).toBe(false)
    expect(isTransactionResponse(undefined)).toBe(false)
  })
})

describe('validateAbi', () => {
  it('Should not throw any errors if abi is valid', () => {
    const spyValidateInputs = jest
      .spyOn(validations, 'validateInputs')
      .mockImplementation(() => {})
    const spyValidateOutputs = jest
      .spyOn(validations, 'validateOutputs')
      .mockImplementation(() => {})
    const abi = new ethers.utils.Interface([
      ...standard,
      {
        name: 'transfer',
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ])
    expect(() => validations.validateAbi(standard, abi)).not.toThrow()
    expect(spyValidateInputs).toHaveBeenCalledTimes(2) // one time for the function and other one for the event
    expect(spyValidateOutputs).toHaveBeenCalledTimes(1) // one time for the function
  })

  it('Should throw an error if abi is invalid', () => {
    const expectedErrors = [
      errors.ABI_ITEM_NOT_FOUND(
        'allowance(address,address)',
        AbiItemTypes.FUNCTION
      ),
      errors.ABI_ITEM_NOT_FOUND('Approval(address,address)', AbiItemTypes.EVENT)
    ]
    jest
      .spyOn(validations, 'validateInputs')
      .mockImplementation(() => expectedErrors)
    const abi = new ethers.utils.Interface([
      {
        inputs: [
          {
            name: 'owner',
            type: 'address'
          },
          {
            name: 'spender',
            type: 'address'
          }
        ],
        name: 'Other',
        type: 'event'
      }
    ])
    expect(async () => validateAbi(standard, abi)).rejects.toStrictEqual(
      expectedErrors
    )
  })
})

describe('validateInputs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })
  it('should call to validateIO with the standard inputs and abi inputs', () => {
    const errorsToThrow: Error[] = []
    const iStandard2 = new ethers.utils.Interface([
      ...standard,
      {
        name: 'transfer',
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
        outputs: [
          {
            name: '',
            type: 'uint256'
          }
        ]
      }
    ])
    const iStandard = new ethers.utils.Interface(standard)
    const iStandardFunction = iStandard.getFunction(
      'allowance(address,address)'
    )
    const iStandardFunction2 = iStandard2.getFunction(
      'allowance(address,address)'
    )
    const spyValIO = jest
      .spyOn(validations, 'validateIO')
      .mockImplementation(() => {})
    validateInputs(
      iStandardFunction,
      iStandardFunction2,
      errorsToThrow,
      'allowance(address,address)',
      AbiItemTypes.FUNCTION
    )
    expect(spyValIO).toHaveBeenCalledWith(
      iStandardFunction.inputs,
      iStandardFunction2.inputs,
      errorsToThrow,
      'allowance(address,address)',
      AbiItemTypes.FUNCTION,
      'input'
    )
  })
})

describe('validateOutputs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })
  it('should call to validateIO with the standard outputs and abi outputs', () => {
    const errorsToThrow: Error[] = []
    const iStandard2 = new ethers.utils.Interface([
      ...standard,
      {
        name: 'transfer',
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
        outputs: [
          {
            name: '',
            type: 'uint256'
          }
        ]
      }
    ])
    const iStandard = new ethers.utils.Interface(standard)
    const iStandardFunction = iStandard.getFunction(
      'allowance(address,address)'
    )
    const iStandardFunction2 = iStandard2.getFunction(
      'allowance(address,address)'
    )
    const spyValIO = jest
      .spyOn(validations, 'validateIO')
      .mockImplementation(() => {})
    validateOutputs(
      iStandardFunction,
      iStandardFunction2,
      errorsToThrow,
      'allowance(address,address)',
      AbiItemTypes.FUNCTION
    )
    expect(spyValIO).toHaveBeenCalledWith(
      iStandardFunction.outputs,
      iStandardFunction2.outputs,
      errorsToThrow,
      'allowance(address,address)',
      AbiItemTypes.FUNCTION,
      'output'
    )
  })
})

describe('validateIO', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })
  it('should keep the same array of errors if there are no errors when called with inputs', () => {
    const errorsToThrow: Error[] = []
    const iStandard2 = new ethers.utils.Interface([
      ...standard,
      {
        name: 'transfer',
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ])
    const iStandard = new ethers.utils.Interface(standard)
    const iStandardFunction = iStandard.getFunction(
      'allowance(address,address)'
    )
    const iStandardFunction2 = iStandard2.getFunction(
      'allowance(address,address)'
    )
    validateIO(
      iStandardFunction.inputs,
      iStandardFunction2.inputs,
      errorsToThrow,
      'allowance(address,address)',
      AbiItemTypes.FUNCTION,
      'input'
    )
    expect(errorsToThrow).toEqual([])
  })

  it('should keep the same array of errors if there are no errors when called with outputs', () => {
    const errorsToThrow: Error[] = []
    const iStandard2 = new ethers.utils.Interface([
      ...standard,
      {
        name: 'transfer',
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ])
    const iStandard = new ethers.utils.Interface(standard)
    const iStandardFunction = iStandard.getFunction(
      'allowance(address,address)'
    )
    const iStandardFunction2 = iStandard2.getFunction(
      'allowance(address,address)'
    )
    validateIO(
      iStandardFunction.outputs,
      iStandardFunction2.outputs,
      errorsToThrow,
      'allowance(address,address)',
      AbiItemTypes.FUNCTION,
      'output'
    )
    expect(errorsToThrow).toEqual([])
  })

  it('should add an error if number of outputs of a function is different', () => {
    const errorsToThrow: Error[] = []
    const notStandard = [
      standard[0],
      {
        inputs: [
          {
            name: 'owner',
            type: 'address'
          },
          {
            name: 'spender',
            type: 'address'
          }
        ],
        name: 'allowance',
        outputs: [
          {
            name: '',
            type: 'uint256'
          },
          {
            name: '',
            type: 'uint256'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ]
    const iStandard = new ethers.utils.Interface(standard)
    const iNotStandard = new ethers.utils.Interface(notStandard)
    const iStandardFunction = iStandard.getFunction(
      'allowance(address,address)'
    )
    const iNotStandardFunction = iNotStandard.getFunction(
      'allowance(address,address)'
    )
    validateIO(
      iStandardFunction.outputs,
      iNotStandardFunction.outputs,
      errorsToThrow,
      'allowance(address,address)',
      AbiItemTypes.FUNCTION,
      'output'
    )
    expect(errorsToThrow).toEqual([
      errors.ABI_ITEM_IO_LENGTH_MISMATCH(
        'allowance(address,address)',
        AbiItemTypes.FUNCTION,
        'output'
      )
    ])
  })

  it('should add an error if the number of outputs are the same, but have different types', () => {
    const errorsToThrow: Error[] = []
    const notStandard = [
      standard[0],
      {
        inputs: [
          {
            name: 'owner',
            type: 'address'
          },
          {
            name: 'spender',
            type: 'address'
          }
        ],
        name: 'allowance',
        outputs: [
          {
            name: '',
            type: 'address'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ]
    const iStandard = new ethers.utils.Interface(standard)
    const iNotStandard = new ethers.utils.Interface(notStandard)
    const iStandardFunction = iStandard.getFunction(
      'allowance(address,address)'
    )
    const iNotStandardFunction = iNotStandard.getFunction(
      'allowance(address,address)'
    )
    validateIO(
      iStandardFunction.outputs,
      iNotStandardFunction.outputs,
      errorsToThrow,
      'allowance(address,address)',
      AbiItemTypes.FUNCTION,
      'output'
    )
    expect(errorsToThrow).toEqual([
      errors.ABI_ITEM_IO_TYPES_MISMATCH(
        'allowance(address,address)',
        AbiItemTypes.FUNCTION,
        'output'
      )
    ])
  })

  it('Should add an error if the number of inputs is the same, but the order of types is different', () => {
    const errorsToThrow: Error[] = []
    const standard2 = [
      standard[0],
      {
        inputs: [
          {
            name: 'owner',
            type: 'uint256'
          },
          {
            name: 'spender',
            type: 'address'
          }
        ],
        name: 'allowance',
        outputs: [
          {
            name: '',
            type: 'uint256'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ]
    const notStandard = [
      standard[0],
      {
        inputs: [
          {
            name: 'spender',
            type: 'address'
          },
          {
            name: 'owner',
            type: 'uint256'
          }
        ],
        name: 'allowance',
        outputs: [
          {
            name: '',
            type: 'uint256'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ]
    const iStandard = new ethers.utils.Interface(standard2)
    const iNotStandard = new ethers.utils.Interface(notStandard)
    const iStandardFunction = iStandard.getFunction(
      'allowance(uint256,address)'
    )
    const iNotStandardFunction = iNotStandard.getFunction(
      'allowance(address,uint256)'
    )
    validateIO(
      iStandardFunction.inputs,
      iNotStandardFunction.inputs,
      errorsToThrow,
      'allowance(address,address)',
      AbiItemTypes.FUNCTION,
      'input'
    )
    expect(errorsToThrow).toEqual([
      errors.ABI_ITEM_IO_TYPES_MISMATCH(
        'allowance(address,address)',
        AbiItemTypes.FUNCTION,
        'input'
      )
    ])
  })
})

describe('implementsFunction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })
  it('Should return true if abi implements the function with params', () => {
    const functionName = 'allowance'
    const params = ['address', 'address']
    const signature = `${functionName}(${params.join(',')})`
    const abi = new ethers.utils.Interface(standard)
    const spyGetFuntion = jest.spyOn(abi, 'getFunction')
    expect(implementsFunction(abi, functionName, params)).toBe(true)
    expect(spyGetFuntion).toHaveBeenCalledWith(signature)
  })

  it('Should return true if abi implements the function without params', () => {
    const functionName = 'allowance'
    const signature = `${functionName}`
    const abi = new ethers.utils.Interface(standard)
    const spyGetFuntion = jest.spyOn(abi, 'getFunction')
    expect(implementsFunction(abi, functionName)).toBe(true)
    expect(spyGetFuntion).toHaveBeenCalledWith(signature)
  })

  it('Should return false if abi not implements the function', () => {
    const functionName = 'fakeFunction'
    const params = ['fake']
    const abi = new ethers.utils.Interface(standard)
    expect(implementsFunction(abi, functionName, params)).toBe(false)
  })
})
