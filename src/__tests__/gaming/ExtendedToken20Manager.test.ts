import { BigNumber } from 'ethers'
import { ExtendedToken20Manager } from '../../gaming'
import { ContractManager } from '../../managers'
import { UnitTypes } from '../../types/enums'
import errors from '../../types/errors'
import {
  ExecuteResponse,
  TransactionResponseExtended
} from '../../types/interfaces'

const fakeTransactionExecuteResponse: ExecuteResponse = {
  isTransaction: true,
  transactionResponse: {} as unknown as TransactionResponseExtended
}

describe('ExtendedToken20Manager constructor', () => {
  it('Should instanciate the ExtendedToken20Manager', () => {
    const spyWarn = jest.spyOn(console, 'warn').mockImplementationOnce(() => {})
    const sdk = new ExtendedToken20Manager()
    expect(sdk).toBeDefined()
    expect(sdk).toBeInstanceOf(ExtendedToken20Manager)
    expect(spyWarn).toBeCalledWith(
      'Deprecation notice: the ExtendedToken20Manager class is being deprecated. Use Token20Manager instead.'
    )
  })
})

describe('ExtendedToken20Manager IERC20Metadata methods', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {})
  })
  it('Should return the name of the token', async () => {
    const spyExecuteFunction = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce({
        isTransaction: false,
        value: 'sample name'
      })
    const sdk = new ExtendedToken20Manager()
    const result = await sdk.name()
    expect(result).toBe('sample name')
    expect(spyExecuteFunction).toHaveBeenCalledWith({
      method: 'name'
    })
  })

  it('Should return the symbol of the token', async () => {
    const spyExecuteFunction = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce({
        isTransaction: false,
        value: 'CS'
      })
    const sdk = new ExtendedToken20Manager()
    const result = await sdk.symbol()
    expect(result).toBe('CS')
    expect(spyExecuteFunction).toHaveBeenCalledWith({
      method: 'symbol'
    })
  })

  it('Should return the decimals of the token', async () => {
    const spyExecuteFunction = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce({
        isTransaction: false,
        value: BigNumber.from(18)
      })
    const sdk = new ExtendedToken20Manager()
    const result = await sdk.decimals()
    expect(result).toStrictEqual(BigNumber.from(18))
    expect(spyExecuteFunction).toHaveBeenCalledWith({
      method: 'decimals'
    })
  })
})

describe('ExtendedToken20Manager mint method', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {})
  })
  it('Should throw an error due not passing to parameter', () => {
    const sdk = new ExtendedToken20Manager()
    expect(sdk.mint()).rejects.toThrow(errors.IS_REQUIRED('to'))
  })

  it('Should throw an error due not passing amount parameter', () => {
    const sdk = new ExtendedToken20Manager()
    expect(
      sdk.mint('0x1234567890123456789012345678901234567890')
    ).rejects.toThrow(errors.IS_REQUIRED('amount'))
  })

  it('Should mint a new token and return a tx hash', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new ExtendedToken20Manager()
    const result = await sdk.mint('0x000000001', '1')
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'mint',
      params: ['0x000000001', BigNumber.from('1000000000000000000')]
    })
  })
  it('Should mint a new token with the provided unit and return a tx hash', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new ExtendedToken20Manager()
    const result = await sdk.mint('0x000000001', '1', UnitTypes.GWEI)
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'mint',
      params: ['0x000000001', BigNumber.from('1000000000')]
    })
  })
})

describe('ExtendedToken20Manager burn method', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {})
  })
  it('Should burn sender tokens and return a tx hash', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new ExtendedToken20Manager()
    const result = await sdk.burn('1')
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'burn',
      params: [BigNumber.from('1000000000000000000')]
    })
  })

  it('Should burn sender tokens with empty account and the provided unit and return a tx hash', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new ExtendedToken20Manager()
    const result = await sdk.burn('1', UnitTypes.GWEI)
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'burn',
      params: [BigNumber.from('1000000000')]
    })
  })

  it('Should burn sender tokens with undefined account and the provided unit and return a tx hash', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new ExtendedToken20Manager()
    const result = await sdk.burn('1', UnitTypes.GWEI)
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'burn',
      params: [BigNumber.from('1000000000')]
    })
  })

  it('Should throw an error due not passing amount parameter', () => {
    const sdk = new ExtendedToken20Manager()
    expect(sdk.burn()).rejects.toThrow(errors.IS_REQUIRED('amount'))
  })
})

describe('ExtendedToken20Manager burnFrom method', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {})
  })
  it('Should burnFrom tokens and return a tx hash', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new ExtendedToken20Manager()
    const result = await sdk.burnFrom('0xfakeaddress', '1')
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'burnFrom',
      params: ['0xfakeaddress', BigNumber.from('1000000000000000000')]
    })
  })

  it('Should burnFrom tokens with the provided unit and return a tx hash', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new ExtendedToken20Manager()
    const result = await sdk.burnFrom('0xfakeaddress', '1', UnitTypes.GWEI)
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'burnFrom',
      params: ['0xfakeaddress', BigNumber.from('1000000000')]
    })
  })

  it('Should throw an error due not passing amount parameter', () => {
    const sdk = new ExtendedToken20Manager()
    expect(sdk.burnFrom('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('amount')
    )
  })

  it('Should throw an error due not passing account parameter', () => {
    const sdk = new ExtendedToken20Manager()
    expect(sdk.burnFrom(undefined, '1')).rejects.toThrow(
      errors.IS_REQUIRED('account')
    )
  })
})

describe('ExtendedToken20Manager pause method', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {})
  })
  it('Should pause the contract and return a tx hash', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new ExtendedToken20Manager()
    const result = await sdk.pause()
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'pause'
    })
  })
})

describe('ExtendedToken20Manager unpause method', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {})
  })
  it('Should unpause the contract and return a tx hash', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new ExtendedToken20Manager()
    const result = await sdk.unpause()
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'unpause'
    })
  })
})

describe('ExtendedToken20Manager permit method', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {})
  })

  it('Should throw an error if owner address is not provided', async () => {
    const sdk = new ExtendedToken20Manager()
    expect(sdk.permit()).rejects.toThrow(errors.IS_REQUIRED('owner'))
  })

  it('Should throw an error if spender address is not provided', async () => {
    const sdk = new ExtendedToken20Manager()
    expect(sdk.permit('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('spender')
    )
  })

  it('Should throw an error if value is not provided', async () => {
    const sdk = new ExtendedToken20Manager()
    expect(sdk.permit('0xfakeaddress', '0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('value')
    )
  })

  it('Should throw an error if deadline is not provided', async () => {
    const sdk = new ExtendedToken20Manager()
    expect(sdk.permit('0xfakeaddress', '0xfakeaddress', '1')).rejects.toThrow(
      errors.IS_REQUIRED('deadline')
    )
  })

  it('Should throw an error if v is not provided', async () => {
    const sdk = new ExtendedToken20Manager()
    expect(
      sdk.permit('0xfakeaddress', '0xfakeaddress', '1', '1')
    ).rejects.toThrow(errors.IS_REQUIRED('v'))
  })

  it('Should throw an error if r is not provided', async () => {
    const sdk = new ExtendedToken20Manager()
    expect(
      sdk.permit('0xfakeaddress', '0xfakeaddress', '1', '1', 1)
    ).rejects.toThrow(errors.IS_REQUIRED('r'))
  })

  it('Should throw an error if s is not provided', async () => {
    const sdk = new ExtendedToken20Manager()
    expect(
      sdk.permit('0xfakeaddress', '0xfakeaddress', '1', '1', 1, '1')
    ).rejects.toThrow(errors.IS_REQUIRED('s'))
  })

  it('Should execute the permit function and return a tx hash', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new ExtendedToken20Manager()
    const result = await sdk.permit(
      '0xfakeaddress',
      '0xfakeaddress',
      '1',
      '2',
      3,
      '4',
      '5'
    )
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'permit',
      params: ['0xfakeaddress', '0xfakeaddress', '1', '2', 3, '4', '5']
    })
  })
})

describe('ExtendedToken20Manager nonces method', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {})
  })

  it('Should throw error if owner is not provided', () => {
    const sdk = new ExtendedToken20Manager()
    expect(sdk.nonces()).rejects.toThrow(errors.IS_REQUIRED('owner'))
  })

  it('should return the nonce of the owner', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce({
        isTransaction: false,
        value: '0xhash'
      })

    const sdk = new ExtendedToken20Manager()
    const nonce = await sdk.nonces('0xfakeaddress')
    expect(nonce).toBe('0xhash')
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'nonces',
      params: ['0xfakeaddress']
    })
  })
})

describe('ExtendedToken20Manager domainSeparator method', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {})
  })
  it('should return the domain separator', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce({
        isTransaction: false,
        value: '0xhash'
      })

    const sdk = new ExtendedToken20Manager()
    const domain = await sdk.domainSeparator()
    expect(domain).toBe('0xhash')
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'DOMAIN_SEPARATOR'
    })
  })
})
