const errors = {
  SDK_NOT_INITIALIZED: new Error('SDK is not initialized'),
  PROVIDER_NOT_INITIALIZED: new Error('Not initialized'),
  SDK_ACTIVATION_IN_PROGRESS: new Error(
    'ContractManager activation in progress'
  ),
  UNKNOWN_METHOD: (method: string) => new Error(`Unknown method ${method}`),
  UNKNOWN_METHOD_WITH_RECOMENDATION: (method: string, posibleMethods: string) =>
    new Error(`Method ${method} not found, did you mean ${posibleMethods}?`),
  PAYABLE_METHOD_REQUIRED_VALUE: new Error('Payable function, required value'),
  NOT_PAYABLE_METHOD_WITH_VALUE_PROVIDED: new Error(
    'Not payable function should not receive value'
  ),
  MISSING_PARAM: (param: string) => new Error(`Missing parameter ${param}`),
  INVALID_PARAM_TYPE: (param: string, expected: string, received: string) =>
    new Error(
      `Invalid parameter ${param} type, expected ${expected} got ${received}`
    ),
  INVALID_PARAMETER: (param: string) => new Error(`Invalid parameter ${param}`),
  INVALID_PARAMETER_COUNT: (expected: number, passed: number) =>
    new Error(
      `Number of expected parameters:${expected}. Number of passed parameters:${passed}`
    ),
  TRANSACTION_FAILED: (error?: Error) =>
    new Error('Transaction failed', { cause: error }),
  NO_ACCOUNT: (error?: Error) =>
    new Error('No account found', { cause: error }),
  NO_ETHEREUM: new Error('No ethereum provider found'),
  NO_PROVIDER: new Error('No provider found'),
  INVALID_VALUE_TYPE: new Error('Invalid type of value in payable function'),
  MUST_ACTIVATE: new Error(
    'Web3Provider must be activated. Call activate method first.'
  ),
  IS_REQUIRED: (param: string) => new Error(`${param} is required`),
  INVALID_SIGNER: new Error(
    'Signer address does not match requested signing address'
  ),
  SIGNER_WITHOUT_PROVIDER: new Error('Signer must have a provider'),
  INVALID_SIGNATURE: (error?: Error) =>
    new Error('Invalid signature.', { cause: error }),
  SDK_ACTIVATION_FAILED: (error: Error) =>
    new Error('SDK activation failed', { cause: error }),
  NOT_A_NUMBER: (param: string) => new Error(`${param} is not a number`),
  NOT_BIGNUMBERISH: (param: string) =>
    new Error(`${param} is not BigNumberish`),
  INVALID_EVENT: (param: string) =>
    new Error(`${param} event does not belong to contract`),
  INVALID_EVENT_PARAMETER: (param: string) =>
    new Error(`event does not have ${param} input or invalid type`),
  GET_TOKEN_URI: (param: string, error?: Error) =>
    new Error(
      `Error while retrieving tokenURI from token with id ${param}, token id may not exists`,
      { cause: error }
    ),
  ABI_ITEM_NOT_FOUND: (itemName: string, itemType: string) =>
    new Error(`${itemName} ${itemType} not found on abi`),
  ABI_ITEM_IO_LENGTH_MISMATCH: (
    itemName: string,
    itemType: string,
    type: string
  ) =>
    new Error(
      `The number of ${type} of ${itemName} ${itemType} is not correct`
    ),
  ABI_ITEM_IO_TYPES_MISMATCH: (
    itemName: string,
    itemType: string,
    type: string
  ) => new Error(`${type} types mismatch on ${itemType} ${itemName} `),
  EIP2612_PERMIT_MESSAGE_INVALID: new Error(
    'EIP2612 permit message is invalid'
  ),
  EIP2612_DAI_PERMIT_MESSAGE_INVALID: new Error(
    'EIP2612 DAI permit message is invalid'
  ),
  READ_ONLY: (funcName: string) =>
    new Error(
      `Connector is in read only mode, unable to execute function ${funcName}`
    ),
  PARAMETER_NOT_SUPPORTED_ON_LEGACY_CHAIN: (param: string) =>
    new Error(`Invalid parameter ${param} in legacy chain (before EIP-1559)`),
  PARAMETER_NOT_SUPPORTED_ON_NON_LEGACY_CHAIN: (param: string) =>
    new Error(
      `Invalid parameter ${param} in non legacy chain (after EIP-1559)`
    ),
  BALANCE_OF_FAILED: (param: string, error?: Error) =>
    new Error(
      `Error while retrieving the balance of the owner with address ${param}`,
      { cause: error }
    ),
  FUNCTION_NOT_IMPLEMENTED: (contractAddr: string, fn: string) =>
    new Error(
      `The ${contractAddr} contract does not implement the ${fn} function`
    )
}

export default errors
