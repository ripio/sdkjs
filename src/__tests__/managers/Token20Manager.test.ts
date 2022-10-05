import { BigNumber } from 'ethers'
import { ContractManager, Token20Manager } from '../../managers'
import { UnitTypes } from '../../types/enums'
import errors from '../../types/errors'
import { validations } from '../../utils'
import erc20 from '../../erc_standards/ERC20.json'
import {
  ExecuteResponse,
  TransactionResponseExtended
} from '../../types/interfaces'

const fakeTransactionExecuteResponse: ExecuteResponse = {
  isTransaction: true,
  transactionResponse: {} as unknown as TransactionResponseExtended
}

describe('Token20Manager validateStandard method', () => {
  it('Should validate the functions and events of the ERC20 contract', async () => {
    const spyRequireParam = jest
      .spyOn(validations, 'requireParam')
      .mockImplementation(() => {})
    const spyValidateAbi = jest
      .spyOn(validations, 'validateAbi')
      .mockImplementation(() => {})
    const sdk = new Token20Manager()
    sdk.validateStandard()
    expect(spyRequireParam).toHaveBeenCalledWith(
      sdk['_abi'],
      errors.SDK_NOT_INITIALIZED
    )
    expect(spyValidateAbi).toHaveBeenCalledWith(erc20, sdk['_abi'])
  })
})

describe('Token20Manager totalSupply method', () => {
  it('Should return the total supply', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue({
        isTransaction: false,
        value: BigNumber.from('1000000000000000000')
      })

    const sdk = new Token20Manager()
    const totalSupply = await sdk.totalSupply()
    expect(totalSupply).not.toBe(undefined)
    expect(totalSupply).toStrictEqual(BigNumber.from('1000000000000000000'))
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'totalSupply'
    })
  })
})

describe('Token20Manager balanceOf method', () => {
  it('Should return the balance of the provided account', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue({
        isTransaction: false,
        value: BigNumber.from('1000000000000000000')
      })

    const sdk = new Token20Manager()
    const balance = await sdk.balanceOf('0xfakeaddress')
    expect(balance).not.toBe(undefined)
    expect(balance).toStrictEqual(BigNumber.from('1000000000000000000'))
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'balanceOf',
      params: ['0xfakeaddress']
    })
  })

  it('Should throw an error due not passing account parameter', () => {
    const sdk = new Token20Manager()
    expect(sdk.balanceOf()).rejects.toThrow(errors.IS_REQUIRED('account'))
  })
})

describe('Token20Manager transfer method', () => {
  it('Should throw an error due not passing amount parameter', () => {
    const sdk = new Token20Manager()
    expect(sdk.transfer('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('amount')
    )
  })

  it('Should throw an error due not passing to parameter', () => {
    const sdk = new Token20Manager()
    expect(sdk.transfer(undefined, '1')).rejects.toThrow(
      errors.IS_REQUIRED('to')
    )
  })

  it('Should transfer tokens to the provided account and return a tx hash', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new Token20Manager()
    const result = await sdk.transfer('0xfakeaddress', '1')
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'transfer',
      params: ['0xfakeaddress', BigNumber.from('1000000000000000000')]
    })
  })

  it('Should transfer tokens to the provided account and return a tx hash with the provided unit', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new Token20Manager()
    const result = await sdk.transfer('0xfakeaddress', '1', UnitTypes.GWEI)
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'transfer',
      params: ['0xfakeaddress', BigNumber.from('1000000000')]
    })
  })
})

describe('Token20Manager allowance method', () => {
  it('Should return the allowance of the provided account', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue({
        isTransaction: false,
        value: BigNumber.from('1000000000000000000')
      })

    const sdk = new Token20Manager()
    const allowance = await sdk.allowance('0xfakeaddress1', '0xfakeaddress2')
    expect(allowance).not.toBe(undefined)
    expect(allowance).toStrictEqual(BigNumber.from('1000000000000000000'))
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'allowance',
      params: ['0xfakeaddress1', '0xfakeaddress2']
    })
  })

  it('Should throw an error due not passing owner parameter', () => {
    const sdk = new Token20Manager()
    expect(sdk.allowance()).rejects.toThrow(errors.IS_REQUIRED('owner'))
  })

  it('Should throw an error due not passing spender parameter', () => {
    const sdk = new Token20Manager()
    expect(sdk.allowance('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('spender')
    )
  })
})

describe('Token20Manager approve method', () => {
  it('Should approve the provided amount to the provided spender and return a tx hash', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new Token20Manager()
    const result = await sdk.approve('0xfakeaddress1', '1')
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'approve',
      params: ['0xfakeaddress1', BigNumber.from('1000000000000000000')]
    })
  })

  it('Should approve the provided amount to the provided spender and return a tx hash with the provided unit', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new Token20Manager()
    const result = await sdk.approve('0xfakeaddress1', '1', UnitTypes.GWEI)
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'approve',
      params: ['0xfakeaddress1', BigNumber.from('1000000000')]
    })
  })

  it('Should throw an error due not passing spender parameter', () => {
    const sdk = new Token20Manager()
    expect(sdk.approve(undefined, '1')).rejects.toThrow(
      errors.IS_REQUIRED('spender')
    )
  })

  it('Should throw an error due not passing amount parameter', () => {
    const sdk = new Token20Manager()
    expect(sdk.approve('0xfakeaddress1')).rejects.toThrow(
      errors.IS_REQUIRED('amount')
    )
  })
})

describe('Token20Manager transferFrom method', () => {
  it('Should transfer tokens from the provided account to the provided spender and return a tx hash', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new Token20Manager()
    const result = await sdk.transferFrom(
      '0xfakeaddress1',
      '0xfakeaddress2',
      '1'
    )
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'transferFrom',
      params: [
        '0xfakeaddress1',
        '0xfakeaddress2',
        BigNumber.from('1000000000000000000')
      ]
    })
  })

  it('Should transfer tokens from the provided account to the provided spender and return a tx hash with the provided unit', async () => {
    const spyExecute = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue(fakeTransactionExecuteResponse)

    const sdk = new Token20Manager()
    const result = await sdk.transferFrom(
      '0xfakeaddress1',
      '0xfakeaddress2',
      '1',
      UnitTypes.GWEI
    )
    expect(result).toBe(fakeTransactionExecuteResponse.transactionResponse)
    expect(spyExecute).toHaveBeenCalledWith({
      method: 'transferFrom',
      params: ['0xfakeaddress1', '0xfakeaddress2', BigNumber.from('1000000000')]
    })
  })

  it('Should throw an error due not passing from parameter', () => {
    const sdk = new Token20Manager()
    expect(sdk.transferFrom(undefined, '0xfakeaddress2', '1')).rejects.toThrow(
      errors.IS_REQUIRED('from')
    )
  })

  it('Should throw an error due not passing to parameter', () => {
    const sdk = new Token20Manager()
    expect(sdk.transferFrom('0xfakeaddress1', undefined, '1')).rejects.toThrow(
      errors.IS_REQUIRED('to')
    )
  })

  it('Should throw an error due not passing amount parameter', () => {
    const sdk = new Token20Manager()
    expect(
      sdk.transferFrom('0xfakeaddress1', '0xfakeaddress2')
    ).rejects.toThrow(errors.IS_REQUIRED('amount'))
  })
})
