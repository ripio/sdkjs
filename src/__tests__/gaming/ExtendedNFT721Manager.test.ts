import { ExtendedNFT721Manager } from '../../gaming'
import { ContractManager } from '../../managers'
import { Ipfs } from '../../utils/Ipfs'
import errors from '../../types/errors'
import { TokenDataTypes } from '../../types/enums'
import {
  ExecuteResponse,
  TransactionResponseExtended
} from '../../types/interfaces'

const fakeTransactionExecuteResponse: ExecuteResponse = {
  isTransaction: true,
  transactionResponse: {} as unknown as TransactionResponseExtended
}

describe('ExtendedNFT721Manager constructor', () => {
  it('Should instanciate the ExtendedNFT721Manager', () => {
    const sdk = new ExtendedNFT721Manager()
    expect(sdk).toBeDefined()
    expect(sdk).toBeInstanceOf(ExtendedNFT721Manager)
  })
})

describe('ExtendedNFT721Manager activate', () => {
  it('Should activate the ExtendedNFT721Manager with ipfs url', async () => {
    const spySuperActivate = jest
      .spyOn(ContractManager.prototype, 'activate')
      .mockImplementation(jest.fn())
    const sdk = new ExtendedNFT721Manager()
    await sdk.activate({
      contractAddress: '0x000',
      contractAbi: [],
      providerUrl: 'ws://fake',
      privateKey: 'fake-pk',
      ipfs: 'ipfs://fake'
    })
    expect(spySuperActivate).toHaveBeenCalled()
    expect(sdk.ipfs).toBeDefined()
  })

  it('Should activate the ExtendedNFT721Manager with ipfs instance', async () => {
    const spySuperActivate = jest
      .spyOn(ContractManager.prototype, 'activate')
      .mockImplementation(jest.fn())
    const sdk = new ExtendedNFT721Manager()
    const ipfs = new Ipfs('ipfs://fake')
    await sdk.activate({
      contractAddress: '0x000',
      contractAbi: [],
      providerUrl: 'ws://fake',
      privateKey: 'fake-pk',
      ipfs
    })
    expect(spySuperActivate).toHaveBeenCalled()
    expect(sdk.ipfs).toBe(ipfs)
  })

  it('Should activate the ExtendedNFT721Manager without ipfs', async () => {
    const spySuperActivate = jest
      .spyOn(ContractManager.prototype, 'activate')
      .mockImplementation(jest.fn())
    const sdk = new ExtendedNFT721Manager()
    await sdk.activate({
      contractAddress: '0x000',
      contractAbi: [],
      providerUrl: 'ws://fake',
      privateKey: 'fake-pk'
    })
    expect(spySuperActivate).toHaveBeenCalled()
    expect(sdk.ipfs).toBe(undefined)
  })
})

describe('ExtendedNFT721Manager isOwnerOf method', () => {
  it('Should throw error due to not passing address', () => {
    const sdk = new ExtendedNFT721Manager()
    expect(sdk.isOwnerOf()).rejects.toThrow(errors.IS_REQUIRED('address'))
  })

  it('Should throw error due to not passing id', () => {
    const sdk = new ExtendedNFT721Manager()
    expect(sdk.isOwnerOf('0x123')).rejects.toThrow(errors.IS_REQUIRED('id'))
  })

  it('Should return true if the address is the owner of the token', async () => {
    const address = '0x456'
    const spyExecuteFunction = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue({
        isTransaction: false,
        value: address
      })
    const sdk = new ExtendedNFT721Manager()
    const result = await sdk.isOwnerOf(address, '1')
    expect(result).toBe(true)
    expect(spyExecuteFunction).toHaveBeenCalledWith({
      method: 'ownerOf',
      params: ['1']
    })
  })

  it('should return true if the address is capitalized and is the owner of the token', async () => {
    const address = '0x456asdQWE'
    const spyExecuteFunction = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue({
        isTransaction: false,
        value: '0x456asdqwe'
      })
    const sdk = new ExtendedNFT721Manager()
    const result = await sdk.isOwnerOf(address, '1')
    expect(result).toBe(true)
    expect(spyExecuteFunction).toHaveBeenCalledWith({
      method: 'ownerOf',
      params: ['1']
    })
  })

  it('Should return false if the address is not the owner of the token', async () => {
    const address = '0x456'
    const spyExecuteFunction = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue({
        isTransaction: false,
        value: '0x123'
      })
    const sdk = new ExtendedNFT721Manager()
    const result = await sdk.isOwnerOf(address, '1')
    expect(result).toBe(false)
    expect(spyExecuteFunction).toHaveBeenCalledWith({
      method: 'ownerOf',
      params: ['1']
    })
  })

  it('Should throw an error if the id does not exist calling isOwnerOf', () => {
    const address = '0x456'
    const spyExecuteFunction = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Token does not exist'))
    const sdk = new ExtendedNFT721Manager()
    expect(sdk.isOwnerOf(address, '1')).rejects.toThrow(
      errors.ADDRESS_OWNERSHIP_ERROR()
    )
    expect(spyExecuteFunction).toHaveBeenCalledWith({
      method: 'ownerOf',
      params: ['1']
    })
  })
})

describe('ExtendedNFT721Manager getIPFSTokenData method', () => {
  it('Should throw error due to not passing tokenId', async () => {
    const sdk = new ExtendedNFT721Manager()
    await expect(sdk.getIPFSTokenData()).rejects.toThrow(
      errors.IS_REQUIRED('tokenId')
    )
  })

  it('Should throw an error when ipfs was not initialized', async () => {
    const sdk = new ExtendedNFT721Manager()
    await expect(sdk.getIPFSTokenData('1')).rejects.toThrow(
      errors.IPFS_NOT_INITIALIZED
    )
  })

  it('Should retrieve the json file of the token', async () => {
    jest
      .spyOn(ContractManager.prototype, 'activate')
      .mockImplementation(jest.fn())
    const sdk = new ExtendedNFT721Manager()
    await sdk.activate({
      contractAddress: '0x000',
      contractAbi: [],
      providerUrl: 'ws://fake',
      privateKey: 'fake-pk',
      ipfs: 'ipfs://fake'
    })
    const metadata = {
      image: 'ipfs://fake-uri/image.png',
      level: 0,
      name: 'RD'
    }
    const spyExecuteFunction = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue({
        isTransaction: false,
        value: 'fake-uri'
      })
    const spyGetIPFSJSON = jest
      .spyOn(Ipfs.prototype, 'getIPFSJSON')
      .mockResolvedValue(metadata)
    const spyGetIPFSBase64 = jest.spyOn(Ipfs.prototype, 'getIPFSBase64')
    const data = await sdk.getIPFSTokenData('0')
    expect(data).toEqual(metadata)
    expect(spyExecuteFunction).toHaveBeenCalledWith({
      method: 'tokenURI(uint256)',
      params: ['0']
    })
    expect(spyGetIPFSJSON).toHaveBeenCalledWith('fake-uri')
    expect(spyGetIPFSBase64).not.toHaveBeenCalled()
  })

  it('Should retrieve the base64 of the token', async () => {
    jest
      .spyOn(ContractManager.prototype, 'activate')
      .mockImplementation(jest.fn())
    const sdk = new ExtendedNFT721Manager()
    await sdk.activate({
      contractAddress: '0x000',
      contractAbi: [],
      providerUrl: 'ws://fake',
      privateKey: 'fake-pk',
      ipfs: 'ipfs://fake'
    })
    const spyExecuteFunction = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue({
        isTransaction: false,
        value: 'fake-uri'
      })
    const spyGetIPFSJSON = jest.spyOn(Ipfs.prototype, 'getIPFSJSON')
    const spyGetIPFSBase64 = jest
      .spyOn(Ipfs.prototype, 'getIPFSBase64')
      .mockResolvedValue('base64Data')
    const data = await sdk.getIPFSTokenData('0', TokenDataTypes.BASE64)
    expect(data).toEqual('base64Data')
    expect(spyExecuteFunction).toHaveBeenCalledWith({
      method: 'tokenURI(uint256)',
      params: ['0']
    })
    expect(spyGetIPFSBase64).toHaveBeenCalledWith('fake-uri')
    expect(spyGetIPFSJSON).not.toHaveBeenCalled()
  })

  it('Should throw an error when the token does not exist', async () => {
    jest
      .spyOn(ContractManager.prototype, 'activate')
      .mockImplementation(jest.fn())
    const sdk = new ExtendedNFT721Manager()
    await sdk.activate({
      contractAddress: '0x000',
      contractAbi: [],
      providerUrl: 'ws://fake',
      privateKey: 'fake-pk',
      ipfs: 'ipfs://fake'
    })
    const spyExecuteFunction = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Token does not exist'))
    const spyGetIPFSJSON = jest.spyOn(Ipfs.prototype, 'getIPFSJSON')
    const spyGetIPFSBase64 = jest.spyOn(Ipfs.prototype, 'getIPFSBase64')

    await expect(sdk.getIPFSTokenData('0')).rejects.toThrow(
      errors.GET_TOKEN_URI('0')
    )
    expect(spyExecuteFunction).toHaveBeenCalledWith({
      method: 'tokenURI(uint256)',
      params: ['0']
    })
    expect(spyGetIPFSJSON).not.toHaveBeenCalled()
    expect(spyGetIPFSBase64).not.toHaveBeenCalled()
  })
})

describe('ExtendedNFT721Manager BURNABLE methods', () => {
  it('Should throw error due to not passing "tokenId" to burn', async () => {
    const sdk = new ExtendedNFT721Manager()
    await expect(sdk.burn()).rejects.toThrow(errors.IS_REQUIRED('tokenId'))
  })

  it('Should throw an error if execute function fails when calling burn', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new ExtendedNFT721Manager()
    await expect(sdk.burn('0')).rejects.toThrow(new Error('Error'))
  })

  it('Should burn a token', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new ExtendedNFT721Manager()

    const result = await sdk.burn('0')

    expect(spy).toHaveBeenCalledWith({
      method: 'burn(uint256)',
      params: ['0']
    })
    expect(result).toEqual(fakeTransactionExecuteResponse.transactionResponse)
  })
})

describe('ExtendedNFT721Manager MINTABLE methods', () => {
  it('Should throw error due to not passing "to" address to mint', async () => {
    const sdk = new ExtendedNFT721Manager()
    await expect(sdk.mint()).rejects.toThrow(errors.IS_REQUIRED('to'))
  })

  it('Should throw error due to not passing "uri" to mint', async () => {
    const sdk = new ExtendedNFT721Manager()
    await expect(sdk.mint('0x000')).rejects.toThrow(errors.IS_REQUIRED('uri'))
  })

  it('Should throw an error if execute function fails when calling mint', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new ExtendedNFT721Manager()
    await expect(sdk.mint('0', 'uri')).rejects.toThrow(new Error('Error'))
  })

  it('Should mint a token', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new ExtendedNFT721Manager()

    const result = await sdk.mint('0', '0xuri')

    expect(spy).toHaveBeenCalledWith({
      method: 'safeMint',
      params: ['0', '0xuri']
    })
    expect(result).toEqual(fakeTransactionExecuteResponse.transactionResponse)
  })
})

describe('ExtendedNFT721Manager PAUSABLE methods', () => {
  it('Should pause the contract', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new ExtendedNFT721Manager()

    const result = await sdk.pause()

    expect(spy).toHaveBeenCalledWith({
      method: 'pause'
    })
    expect(result).toEqual(fakeTransactionExecuteResponse.transactionResponse)
  })

  it('Should throw an error if execute function fails when calling pause', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new ExtendedNFT721Manager()
    await expect(sdk.pause()).rejects.toThrow(new Error('Error'))
  })

  it('Should unpause the contract', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValueOnce(fakeTransactionExecuteResponse)
    const sdk = new ExtendedNFT721Manager()

    const result = await sdk.unpause()

    expect(spy).toHaveBeenCalledWith({
      method: 'unpause'
    })
    expect(result).toEqual(fakeTransactionExecuteResponse.transactionResponse)
  })

  it('Should throw an error if execute function fails when calling unpause', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new ExtendedNFT721Manager()
    await expect(sdk.unpause()).rejects.toThrow(new Error('Error'))
  })
})

describe('ExtendedNFT721Manager IERC721Metadata methods', () => {
  it('Should return the name of the contract', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue({
        isTransaction: false,
        value: 'contractName'
      })
    const sdk = new ExtendedNFT721Manager()

    const result = await sdk.name()

    expect(spy).toHaveBeenCalledWith({
      method: 'name'
    })
    expect(result).toEqual('contractName')
  })

  it('Should throw an error if execute function fails when calling name', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new ExtendedNFT721Manager()
    await expect(sdk.name()).rejects.toThrow(new Error('Error'))
  })

  it('Should return the symbol of the contract', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue({
        isTransaction: false,
        value: 'contractSymbol'
      })
    const sdk = new ExtendedNFT721Manager()

    const result = await sdk.symbol()

    expect(spy).toHaveBeenCalledWith({
      method: 'symbol'
    })
    expect(result).toEqual('contractSymbol')
  })

  it('Should throw an error if execute function fails when calling symbol', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new ExtendedNFT721Manager()
    await expect(sdk.symbol()).rejects.toThrow(new Error('Error'))
  })

  it('Should return the token uri of a token', async () => {
    const spy = jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockResolvedValue({
        isTransaction: false,
        value: 'tokenUri'
      })
    const sdk = new ExtendedNFT721Manager()

    const result = await sdk.tokenURI('0')

    expect(spy).toHaveBeenCalledWith({
      method: 'tokenURI(uint256)',
      params: ['0']
    })
    expect(result).toEqual('tokenUri')
  })

  it('Should throw error due to not passing tokenId', async () => {
    const sdk = new ExtendedNFT721Manager()
    await expect(sdk.tokenURI()).rejects.toThrow(errors.IS_REQUIRED('tokenId'))
  })

  it('Should throw an error if execute function fails when calling tokenURI', async () => {
    jest
      .spyOn(ContractManager.prototype, 'execute')
      .mockRejectedValue(new Error('Error'))
    const sdk = new ExtendedNFT721Manager()
    await expect(sdk.tokenURI('0')).rejects.toThrow(new Error('Error'))
  })
})
