import { MultiToken1155Manager } from '../../managers'
import errors from '../../types/errors'
import { BigNumber } from 'ethers'
import erc1155 from '../../erc_standards/ERC1155.json'
import { validations } from '../../utils'
import {
  ExecuteResponse,
  TransactionResponseExtended
} from '../../types/interfaces'

describe('MultiToken1155Manager constructor', () => {
  it('Should instanciate the MultiToken1155Manager', () => {
    const sdk = new MultiToken1155Manager()
    expect(sdk).toBeDefined()
    expect(sdk).toBeInstanceOf(MultiToken1155Manager)
  })
})

describe('MultiToken1155Manager validateStandard method', () => {
  it('Should validate the functions and events of the ERC1155 contract', async () => {
    const spyRequireParam = jest
      .spyOn(validations, 'requireParam')
      .mockImplementation(() => {})
    const spyValidateAbi = jest
      .spyOn(validations, 'validateAbi')
      .mockImplementation(() => {})
    const sdk = new MultiToken1155Manager()
    sdk.validateStandard()
    expect(spyRequireParam).toHaveBeenCalledWith(
      sdk['_abi'],
      errors.SDK_NOT_INITIALIZED
    )
    expect(spyValidateAbi).toHaveBeenCalledWith(erc1155, sdk['_abi'])
  })
})

describe('MultiToken1155Manager activate', () => {
  it('Should activate the MultiToken1155Manager', async () => {
    const spySuperActivate = jest
      .spyOn(MultiToken1155Manager.prototype, 'activate')
      .mockImplementation(jest.fn())
    const sdk = new MultiToken1155Manager()
    await sdk.activate({
      contractAddress: '0x000',
      contractAbi: [],
      providerUrl: 'ws://fake',
      privateKey: 'fake-pk'
    })
    expect(spySuperActivate).toHaveBeenCalled()
  })

  it('Should activate the MultiToken1155Manager', async () => {
    const spySuperActivate = jest
      .spyOn(MultiToken1155Manager.prototype, 'activate')
      .mockImplementation(jest.fn())
    const sdk = new MultiToken1155Manager()
    await sdk.activate({
      contractAddress: '0x000',
      contractAbi: [],
      providerUrl: 'ws://fake',
      privateKey: 'fake-pk'
    })
    expect(spySuperActivate).toHaveBeenCalled()
  })
})

describe('MultiToken1155Manager IERC1155 methods', () => {
  const fakeTransactionExecuteResponse: ExecuteResponse = {
    isTransaction: true,
    transactionResponse: {} as unknown as TransactionResponseExtended
  }

  it('Should throw error due to not passing the account to get the balance of', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(sdk.balanceOf()).rejects.toThrow(errors.IS_REQUIRED('account'))
  })

  it('Should throw error due to not passing the token id to get the balance of', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(sdk.balanceOf('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('id')
    )
  })

  it('Should throw an error if execute function fails when calling balanceOf', async () => {
    jest
      .spyOn(MultiToken1155Manager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new MultiToken1155Manager()
    await expect(sdk.balanceOf('0xfakeaddress', '1')).rejects.toThrow(
      new Error('Error')
    )
  })

  it('Should get the balance of an address', async () => {
    const spy = jest
      .spyOn(MultiToken1155Manager.prototype, 'execute')
      .mockResolvedValueOnce({
        isTransaction: false,
        value: BigNumber.from('0')
      })
    const sdk = new MultiToken1155Manager()

    const balance = await sdk.balanceOf('0xfakeaddress', '1')

    expect(spy).toHaveBeenCalledWith({
      method: 'balanceOf(address,uint256)',
      params: ['0xfakeaddress', '1']
    })
    expect(balance).toStrictEqual(BigNumber.from('0'))
  })

  it('Should get a batch balance of a batch of addresses', async () => {
    const spy = jest
      .spyOn(MultiToken1155Manager.prototype, 'execute')
      .mockResolvedValueOnce({
        isTransaction: false,
        value: [BigNumber.from('0'), BigNumber.from('0')]
      })
    const sdk = new MultiToken1155Manager()

    const balance = await sdk.balanceOfBatch(
      ['0xfakeaddress', '0xfakeaddress2'],
      ['1', '2']
    )

    expect(spy).toHaveBeenCalledWith({
      method: 'balanceOfBatch(address[],uint256[])',
      params: [
        ['0xfakeaddress', '0xfakeaddress2'],
        ['1', '2']
      ]
    })
    expect(balance).toStrictEqual([BigNumber.from('0'), BigNumber.from('0')])
  })

  it('Should throw error due to not passing an array of addresses to get the balanceOfBatch', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(sdk.balanceOfBatch()).rejects.toThrow(
      errors.IS_REQUIRED('accounts')
    )
  })

  it('Should throw error due to not passing an array of token ids to get the balanceOfBatch', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(sdk.balanceOfBatch(['0xfakeaddress'])).rejects.toThrow(
      errors.IS_REQUIRED('ids')
    )
  })

  it('Should throw an error if execute function fails when calling balanceOfBatch', async () => {
    jest
      .spyOn(MultiToken1155Manager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new MultiToken1155Manager()
    await expect(
      sdk.balanceOfBatch(['0xfakeaddress', '0xfakeaddress2'], ['1', '2'])
    ).rejects.toThrow(new Error('Error'))
  })

  it('Should throw error due to not passing from address to safeTransferFrom', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(sdk.safeTransferFrom()).rejects.toThrow(
      errors.IS_REQUIRED('from')
    )
  })

  it('Should throw error due to not passing to address to safeTransferFrom', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(sdk.safeTransferFrom('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('to')
    )
  })

  it('Should throw error due to not passing token id to safeTransferFrom', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(
      sdk.safeTransferFrom('0xfakeaddress', '0xfakeaddress')
    ).rejects.toThrow(errors.IS_REQUIRED('id'))
  })

  it('Should throw error due to not passing amount to safeTransferFrom', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(
      sdk.safeTransferFrom('0xfakeaddress', '0xfakeaddress', '1')
    ).rejects.toThrow(errors.IS_REQUIRED('amount'))
  })

  it('Should throw error due to not passing data to safeTransferFrom', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(
      sdk.safeTransferFrom('0xfakeaddress', '0xfakeaddress', '1', '1')
    ).rejects.toThrow(errors.IS_REQUIRED('data'))
  })

  it('Should throw an error if execute function fails when calling safeTransferFrom', async () => {
    jest
      .spyOn(MultiToken1155Manager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new MultiToken1155Manager()
    await expect(
      sdk.safeTransferFrom('0xfakeaddress', '0xfakeaddress', '0', '1', '1')
    ).rejects.toThrow(new Error('Error'))
  })

  it('Should transfer (safeTransferFrom) a token with data', async () => {
    const spy = jest
      .spyOn(MultiToken1155Manager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new MultiToken1155Manager()

    const result = await sdk.safeTransferFrom(
      '0xfakeaddress1',
      '0xfakeaddress2',
      '0',
      '1',
      '0xfakeData'
    )

    expect(spy).toHaveBeenCalledWith({
      method: 'safeTransferFrom(address,address,uint256,uint256,bytes)',
      params: ['0xfakeaddress1', '0xfakeaddress2', '0', '1', '0xfakeData']
    })
    expect(result).toEqual(fakeTransactionExecuteResponse.transactionResponse)
  })

  it('Should safeBatchTransferFrom a batch of tokens', async () => {
    const spy = jest
      .spyOn(MultiToken1155Manager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new MultiToken1155Manager()

    const result = await sdk.safeBatchTransferFrom(
      '0xfakeaddress1',
      '0xfakeaddress2',
      ['0', '1'],
      ['1', '1'],
      121234
    )

    expect(spy).toHaveBeenCalledWith({
      method:
        'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)',
      params: [
        '0xfakeaddress1',
        '0xfakeaddress2',
        ['0', '1'],
        ['1', '1'],
        121234
      ]
    })
    expect(result).toEqual(fakeTransactionExecuteResponse.transactionResponse)
  })

  it('Should throw error due to not passing from address to safeBatchTransferFrom', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(sdk.safeBatchTransferFrom()).rejects.toThrow(
      errors.IS_REQUIRED('from')
    )
  })

  it('Should throw error due to not passing to address to safeBatchTransferFrom', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(sdk.safeBatchTransferFrom('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('to')
    )
  })

  it('Should throw error due to not passing an array of token ids to safeBatchTransferFrom', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(
      sdk.safeBatchTransferFrom('0xfakeaddress', '0xfakeaddress')
    ).rejects.toThrow(errors.IS_REQUIRED('ids'))
  })

  it('Should throw error due to not passing an array of amounts to safeBatchTransferFrom', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(
      sdk.safeBatchTransferFrom('0xfakeaddress', '0xfakeaddress', ['0'])
    ).rejects.toThrow(errors.IS_REQUIRED('amounts'))
  })

  it('Should throw error due to not passing data to safeBatchTransferFrom', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(
      sdk.safeBatchTransferFrom('0xfakeaddress', '0xfakeaddress', ['0'], ['1'])
    ).rejects.toThrow(errors.IS_REQUIRED('data'))
  })

  it('Should throw error due to not passing the "operator" address to setApprovalForAll', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(sdk.setApprovalForAll()).rejects.toThrow(
      errors.IS_REQUIRED('operator')
    )
  })

  it('Should throw error due to not passing the "approved" boolean to setApprovalForAll', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(sdk.setApprovalForAll('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('approved')
    )
  })

  it('Should throw an error if execute function fails when calling setApprovalForAll', async () => {
    jest
      .spyOn(MultiToken1155Manager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new MultiToken1155Manager()
    await expect(sdk.setApprovalForAll('0xfakeaddress', true)).rejects.toThrow(
      new Error('Error')
    )
  })

  it('Should set approval to true for all the sender owned tokens', async () => {
    const spy = jest
      .spyOn(MultiToken1155Manager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new MultiToken1155Manager()

    const result = await sdk.setApprovalForAll('0xfakeaddress', true)

    expect(spy).toHaveBeenCalledWith({
      method: 'setApprovalForAll(address,bool)',
      params: ['0xfakeaddress', true]
    })
    expect(result).toEqual(fakeTransactionExecuteResponse.transactionResponse)
  })

  it('Should set approval to false for all the sender owned tokens', async () => {
    const spy = jest
      .spyOn(MultiToken1155Manager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new MultiToken1155Manager()

    const result = await sdk.setApprovalForAll('0xfakeaddress', false)

    expect(spy).toHaveBeenCalledWith({
      method: 'setApprovalForAll(address,bool)',
      params: ['0xfakeaddress', false]
    })
    expect(result).toEqual(fakeTransactionExecuteResponse.transactionResponse)
  })

  it('Should throw error due to not passing the "account" address to isApprovedForAll', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(sdk.isApprovedForAll()).rejects.toThrow(
      errors.IS_REQUIRED('account')
    )
  })

  it('Should throw error due to not passing the "operator" address to isApprovedForAll', async () => {
    const sdk = new MultiToken1155Manager()
    await expect(sdk.isApprovedForAll('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('operator')
    )
  })

  it('Should throw an error if execute function fails when calling isApprovedForAll', async () => {
    jest
      .spyOn(MultiToken1155Manager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new MultiToken1155Manager()
    await expect(sdk.isApprovedForAll('0xfakeaddress', '0')).rejects.toThrow(
      new Error('Error')
    )
  })

  it('Should get if the operator is approved for all the account tokens', async () => {
    const spy = jest
      .spyOn(MultiToken1155Manager.prototype, 'execute')
      .mockResolvedValueOnce({
        isTransaction: false,
        value: true
      })
    const sdk = new MultiToken1155Manager()

    const result = await sdk.isApprovedForAll('0xfakeaddress', '0')

    expect(spy).toHaveBeenCalledWith({
      method: 'isApprovedForAll(address,address)',
      params: ['0xfakeaddress', '0']
    })
    expect(result).toEqual(true)
  })
})
