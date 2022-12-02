import {
  ExecuteResponse,
  TransactionResponseExtended
} from './../../types/interfaces'
import { ContractManager, NFT721Manager } from '../../managers'
import errors from '../../types/errors'
import { BigNumber } from 'ethers'
import erc721 from '../../erc_standards/ERC721.json'
import { validations } from '../../utils'

describe('NFT721Manager constructor', () => {
  it('Should instanciate the NFT721Manager', () => {
    const sdk = new NFT721Manager()
    expect(sdk).toBeDefined()
    expect(sdk).toBeInstanceOf(NFT721Manager)
  })
})

describe('NFT721Manager validateStandard method', () => {
  it('Should validate the functions and events of the ERC721 contract', async () => {
    const spyRequireParam = jest
      .spyOn(validations, 'requireParam')
      .mockImplementation(() => {})
    const spyValidateAbi = jest
      .spyOn(validations, 'validateAbi')
      .mockImplementation(() => {})
    const sdk = new NFT721Manager()
    sdk.validateStandard()
    expect(spyRequireParam).toHaveBeenCalledWith(
      sdk['_abi'],
      errors.SDK_NOT_INITIALIZED
    )
    expect(spyValidateAbi).toHaveBeenCalledWith(erc721, sdk['_abi'])
  })
})

describe('NFT721Manager activate', () => {
  it('Should activate the NFT721Manager', async () => {
    const spySuperActivate = jest
      .spyOn(ContractManager.prototype, 'activate')
      .mockImplementation(jest.fn())
    const sdk = new NFT721Manager()
    await sdk.activate({
      contractAddress: '0x000',
      contractAbi: [],
      providerUrl: 'ws://fake',
      privateKey: 'fake-pk'
    })
    expect(spySuperActivate).toHaveBeenCalled()
  })

  it('Should activate the NFT721Manager', async () => {
    const spySuperActivate = jest
      .spyOn(ContractManager.prototype, 'activate')
      .mockImplementation(jest.fn())
    const sdk = new NFT721Manager()
    await sdk.activate({
      contractAddress: '0x000',
      contractAbi: [],
      providerUrl: 'ws://fake',
      privateKey: 'fake-pk'
    })
    expect(spySuperActivate).toHaveBeenCalled()
  })
})

describe('NFT721Manager IERC721 methods', () => {
  const fakeTransactionExecuteResponse: ExecuteResponse = {
    isTransaction: true,
    transactionResponse: {} as unknown as TransactionResponseExtended
  }

  it('Should throw error due to not passing the owner to get the balance of', async () => {
    const sdk = new NFT721Manager()
    await expect(sdk.balanceOf()).rejects.toThrow(errors.IS_REQUIRED('owner'))
  })

  it('Should throw an error if execute function fails when calling balanceOf', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new NFT721Manager()
    await expect(sdk.balanceOf('0xfakeaddress')).rejects.toThrow(
      new Error('Error')
    )
  })

  it('Should get the balance of an address', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce({
        isTransaction: false,
        value: BigNumber.from('0')
      })
    const sdk = new NFT721Manager()

    const balance = await sdk.balanceOf('0xfakeaddress')

    expect(spy).toHaveBeenCalledWith({
      method: 'balanceOf(address)',
      params: ['0xfakeaddress']
    })
    expect(balance).toStrictEqual(BigNumber.from('0'))
  })

  it('Should throw error due to not passing the tokenId to get the ownerOf', async () => {
    const sdk = new NFT721Manager()
    await expect(sdk.ownerOf()).rejects.toThrow(errors.IS_REQUIRED('tokenId'))
  })

  it('Should throw an error if execute function fails when calling ownerOf', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new NFT721Manager()
    await expect(sdk.ownerOf('0')).rejects.toThrow(new Error('Error'))
  })

  it('Should get the owner of a token', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce({
        isTransaction: false,
        value: '0xfakeaddress'
      })
    const sdk = new NFT721Manager()

    const result = await sdk.ownerOf('0')

    expect(spy).toHaveBeenCalledWith({
      method: 'ownerOf(uint256)',
      params: ['0']
    })
    expect(result).toEqual('0xfakeaddress')
  })

  it('Should throw error due to not passing from address to safeTransferFrom', async () => {
    const sdk = new NFT721Manager()
    await expect(sdk.safeTransferFrom()).rejects.toThrow(
      errors.IS_REQUIRED('from')
    )
  })

  it('Should throw error due to not passing to address to safeTransferFrom', async () => {
    const sdk = new NFT721Manager()
    await expect(sdk.safeTransferFrom('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('to')
    )
  })

  it('Should throw error due to not passing tokenId to safeTransferFrom', async () => {
    const sdk = new NFT721Manager()
    await expect(
      sdk.safeTransferFrom('0xfakeaddress', '0xfakeaddress')
    ).rejects.toThrow(errors.IS_REQUIRED('tokenId'))
  })

  it('Should throw an error if execute function fails when calling safeTransferFrom', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new NFT721Manager()
    await expect(
      sdk.safeTransferFrom('0xfakeaddress', '0xfakeaddress', '0')
    ).rejects.toThrow(new Error('Error'))
  })

  it('Should transfer (safeTransferFrom) a token without data', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new NFT721Manager()

    const result = await sdk.safeTransferFrom(
      '0xfakeaddress1',
      '0xfakeaddress2',
      '0'
    )

    expect(spy).toHaveBeenCalledWith({
      method: 'safeTransferFrom(address,address,uint256)',
      params: ['0xfakeaddress1', '0xfakeaddress2', '0']
    })
    expect(result).toEqual(fakeTransactionExecuteResponse.transactionResponse)
  })

  it('Should transfer (safeTransferFrom) a token with data', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new NFT721Manager()

    const result = await sdk.safeTransferFrom(
      '0xfakeaddress1',
      '0xfakeaddress2',
      '0',
      '0xfakeData'
    )

    expect(spy).toHaveBeenCalledWith({
      method: 'safeTransferFrom(address,address,uint256,bytes)',
      params: ['0xfakeaddress1', '0xfakeaddress2', '0', '0xfakeData']
    })
    expect(result).toEqual(fakeTransactionExecuteResponse.transactionResponse)
  })

  it('Should throw error due to not passing from address to transferFrom', async () => {
    const sdk = new NFT721Manager()
    await expect(sdk.transferFrom()).rejects.toThrow(errors.IS_REQUIRED('from'))
  })

  it('Should throw error due to not passing to address to transferFrom', async () => {
    const sdk = new NFT721Manager()
    await expect(sdk.transferFrom('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('to')
    )
  })

  it('Should throw error due to not passing tokenId to transferFrom', async () => {
    const sdk = new NFT721Manager()
    await expect(
      sdk.transferFrom('0xfakeaddress', '0xfakeaddress')
    ).rejects.toThrow(errors.IS_REQUIRED('tokenId'))
  })

  it('Should throw an error if execute function fails when calling transferFrom', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new NFT721Manager()
    await expect(
      sdk.transferFrom('0xfakeaddress', '0xfakeaddress', '0')
    ).rejects.toThrow(new Error('Error'))
  })

  it('Should transfer (transferFrom) a token', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new NFT721Manager()

    const result = await sdk.transferFrom(
      '0xfakeaddress1',
      '0xfakeaddress2',
      '0'
    )

    expect(spy).toHaveBeenCalledWith({
      method: 'transferFrom',
      params: ['0xfakeaddress1', '0xfakeaddress2', '0']
    })
    expect(result).toEqual(fakeTransactionExecuteResponse.transactionResponse)
  })

  it('Should throw error due to not passing the "to" address to approve', async () => {
    const sdk = new NFT721Manager()
    await expect(sdk.approve()).rejects.toThrow(errors.IS_REQUIRED('to'))
  })

  it('Should throw error due to not passing the "tokenId" to approve', async () => {
    const sdk = new NFT721Manager()
    await expect(sdk.approve('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('tokenId')
    )
  })

  it('Should throw an error if execute function fails when calling approve', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new NFT721Manager()
    await expect(sdk.approve('0xfakeaddress', '0')).rejects.toThrow(
      new Error('Error')
    )
  })

  it('Should approve a token', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new NFT721Manager()

    const result = await sdk.approve('0xfakeaddress', '0')

    expect(spy).toHaveBeenCalledWith({
      method: 'approve(address,uint256)',
      params: ['0xfakeaddress', '0']
    })
    expect(result).toEqual(fakeTransactionExecuteResponse.transactionResponse)
  })

  it('Should throw error due to not passing the "operator" address to setApprovalForAll', async () => {
    const sdk = new NFT721Manager()
    await expect(sdk.setApprovalForAll()).rejects.toThrow(
      errors.IS_REQUIRED('operator')
    )
  })

  it('Should throw error due to not passing the "approved" boolean to setApprovalForAll', async () => {
    const sdk = new NFT721Manager()
    await expect(sdk.setApprovalForAll('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('approved')
    )
  })

  it('Should throw an error if execute function fails when calling setApprovalForAll', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new NFT721Manager()
    await expect(sdk.setApprovalForAll('0xfakeaddress', true)).rejects.toThrow(
      new Error('Error')
    )
  })

  it('Should set approval to true for all the sender owned tokens', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new NFT721Manager()

    const result = await sdk.setApprovalForAll('0xfakeaddress', true)

    expect(spy).toHaveBeenCalledWith({
      method: 'setApprovalForAll(address,bool)',
      params: ['0xfakeaddress', true]
    })
    expect(result).toEqual({})
  })

  it('Should set approval to false for all the sender owned tokens', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new NFT721Manager()

    const result = await sdk.setApprovalForAll('0xfakeaddress', false)

    expect(spy).toHaveBeenCalledWith({
      method: 'setApprovalForAll(address,bool)',
      params: ['0xfakeaddress', false]
    })
    expect(result).toEqual({})
  })

  it('Should throw error due to not passing the "tokenId" to getApproved', async () => {
    const sdk = new NFT721Manager()
    await expect(sdk.getApproved()).rejects.toThrow(
      errors.IS_REQUIRED('tokenId')
    )
  })

  it('Should throw an error if execute function fails when calling getApproved', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new NFT721Manager()
    await expect(sdk.getApproved('0')).rejects.toThrow(new Error('Error'))
  })

  it('Should get the approved address for a token', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce({
        isTransaction: false,
        value: '0xfakeaddress'
      })
    const sdk = new NFT721Manager()

    const result = await sdk.getApproved('0')

    expect(spy).toHaveBeenCalledWith({
      method: 'getApproved(uint256)',
      params: ['0']
    })
    expect(result).toEqual('0xfakeaddress')
  })

  it('Should throw error due to not passing the "owner" address to isApprovedForAll', async () => {
    const sdk = new NFT721Manager()
    await expect(sdk.isApprovedForAll()).rejects.toThrow(
      errors.IS_REQUIRED('owner')
    )
  })

  it('Should throw error due to not passing the "operator" address to isApprovedForAll', async () => {
    const sdk = new NFT721Manager()
    await expect(sdk.isApprovedForAll('0xfakeaddress')).rejects.toThrow(
      errors.IS_REQUIRED('operator')
    )
  })

  it('Should throw an error if execute function fails when calling isApprovedForAll', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new NFT721Manager()
    await expect(sdk.isApprovedForAll('0xfakeaddress', '0')).rejects.toThrow(
      new Error('Error')
    )
  })

  it('Should get if the operator is approved for all the owner tokens', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce({
        isTransaction: false,
        value: true
      })
    const sdk = new NFT721Manager()

    const result = await sdk.isApprovedForAll('0xfakeaddress', '0')

    expect(spy).toHaveBeenCalledWith({
      method: 'isApprovedForAll(address,address)',
      params: ['0xfakeaddress', '0']
    })
    expect(result).toEqual(true)
  })
})
