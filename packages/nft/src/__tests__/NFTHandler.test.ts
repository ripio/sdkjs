import { NFTJsonImageFactory } from './../NFTJsonImageFactory'
import { NFTJsonFactory } from './../NFTJsonFactory'
import { NFTImageFactory } from '../NFTImageFactory'
import { Resource } from '@ripio/sdk-nft'
import { NFTHandler } from './../NFTHandler'
import { errors, NFT721Manager } from '@ripio/sdk'
import StorageType from '../storage/StorageType'
import { NFT_METADATA_FORMAT } from '../types'
import { NFT } from '../NFT'
import { NFTMetadata } from '../types/interfaces'

describe('NFTHandler get function', () => {
  it('Should throw error if the nftManager is not activate', async () => {
    const tokenId = 'fake-tokenId'
    const nftManager = {
      isActive: false
    } as unknown as NFT721Manager
    const storage = {} as StorageType
    await expect(
      NFTHandler.get(nftManager, storage, tokenId, NFT_METADATA_FORMAT.IMAGE)
    ).rejects.toThrow(errors.MUST_ACTIVATE)
  })

  it('Should throw error if the contract does not implement the function tokenURI(uint256)', async () => {
    const tokenId = 'fake-tokenId'
    const contractAddr = 'fake-address'
    const nftManager = {
      isActive: true,
      contractAddr,
      implements: jest.fn().mockReturnValueOnce(false)
    } as unknown as NFT721Manager
    const storage = {} as StorageType

    await expect(
      NFTHandler.get(nftManager, storage, tokenId, NFT_METADATA_FORMAT.IMAGE)
    ).rejects.toThrow(
      errors.FUNCTION_NOT_IMPLEMENTED(contractAddr, 'tokenURI(uint256)')
    )
  })

  it('Should throw error if nftManager.execute function fails', async () => {
    const tokenId = 'fake-tokenId'
    const fakeError = new Error('fake-error')
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest.fn().mockRejectedValueOnce(fakeError)
    } as unknown as NFT721Manager
    const storage = {} as StorageType

    expect(
      async () =>
        await NFTHandler.get(
          nftManager,
          storage,
          tokenId,
          NFT_METADATA_FORMAT.IMAGE
        )
    ).rejects.toThrow(errors.GET_TOKEN_URI(tokenId, fakeError))
  })

  it.each([
    { format: NFT_METADATA_FORMAT.IMAGE, factory: NFTImageFactory },
    { format: NFT_METADATA_FORMAT.JSON, factory: NFTJsonFactory },
    {
      format: NFT_METADATA_FORMAT.JSON_WITH_IMAGE,
      factory: NFTJsonImageFactory
    }
  ])('Should use $factory.name', async ({ format, factory }) => {
    const tokenId = 'fake-tokenId'
    const tokenUri = 'fake-uri'
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest.fn().mockReturnValueOnce({ value: tokenUri })
    } as unknown as NFT721Manager
    const storage = {
      getData: jest.fn().mockResolvedValue({} as unknown as Resource)
    } as unknown as StorageType

    const spyCreateNFT = jest
      .spyOn(factory, 'createNFT')
      .mockResolvedValue({} as unknown as NFT)

    await NFTHandler.get(nftManager, storage, tokenId, format)

    expect(storage.getData).toBeCalledWith(tokenUri)
    expect(spyCreateNFT).toBeCalled()
  })
})

describe('NFTHandler getNFTListByOwner function', () => {
  it('Should throw error if the nftManager is not activate', async () => {
    const owner = 'fake-address'
    const nftManager = {
      isActive: false
    } as unknown as NFT721Manager
    const storage = {} as StorageType
    await expect(
      NFTHandler.getNFTListByOwner(
        nftManager,
        storage,
        owner,
        NFT_METADATA_FORMAT.IMAGE
      )
    ).rejects.toThrow(errors.MUST_ACTIVATE)
  })

  it('Should throw error if the contract does not implement the function tokenOfOwnerByIndex(address,uint256)', async () => {
    const owner = 'fake-address'
    const contractAddr = 'fake-address'
    const nftManager = {
      isActive: true,
      contractAddr,
      implements: jest.fn().mockReturnValueOnce(false)
    } as unknown as NFT721Manager
    const storage = {} as StorageType

    await expect(
      NFTHandler.getNFTListByOwner(
        nftManager,
        storage,
        owner,
        NFT_METADATA_FORMAT.IMAGE
      )
    ).rejects.toThrow(
      errors.FUNCTION_NOT_IMPLEMENTED(
        contractAddr,
        'tokenOfOwnerByIndex(address,uint256)'
      )
    )
  })

  it('Should throw error if nftManager.execute balanceOf(address) function fails ', async () => {
    const owner = 'fake-address'
    const fakeError = new Error('fake-error')
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest.fn().mockRejectedValueOnce(fakeError)
    } as unknown as NFT721Manager
    const storage = {} as StorageType

    expect(
      async () =>
        await NFTHandler.getNFTListByOwner(
          nftManager,
          storage,
          owner,
          NFT_METADATA_FORMAT.IMAGE
        )
    ).rejects.toThrow(errors.BALANCE_OF_FAILED(owner, fakeError))
  })

  it('Should throw error if nftManager.execute tokenOfOwnerByIndex(address,uint256) function fails', async () => {
    const owner = 'fake-address'
    const fakeError = new Error('fake-error')
    const fakeBalance = 3
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest
        .fn()
        .mockReturnValueOnce({ value: fakeBalance })
        .mockRejectedValueOnce(fakeError)
    } as unknown as NFT721Manager
    const storage = {} as StorageType

    expect(
      async () =>
        await NFTHandler.getNFTListByOwner(
          nftManager,
          storage,
          owner,
          NFT_METADATA_FORMAT.IMAGE
        )
    ).rejects.toThrow(errors.TRANSACTION_FAILED(fakeError))
  })

  it('Should return no nft when owner has none', async () => {
    const owner = 'fake-address'
    const fakeBalance = 0
    const nft = {} as unknown as NFT
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest.fn().mockReturnValueOnce({ value: fakeBalance })
    } as unknown as NFT721Manager
    const storage = {} as unknown as StorageType
    const spyGet = jest.spyOn(NFTHandler, 'get').mockResolvedValue(nft)

    const nfts = await NFTHandler.getNFTListByOwner(
      nftManager,
      storage,
      owner,
      NFT_METADATA_FORMAT.IMAGE
    )

    expect(nfts.length).toBe(0)
    expect(spyGet).not.toBeCalled()
  })

  it('Should return nfts when owner has nfts', async () => {
    const owner = 'fake-address'
    const tokenIds = ['fake-tokenId', 'fake-tokenId-2']
    const fakeBalance = 2
    const nft = {} as unknown as NFT
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest
        .fn()
        .mockReturnValueOnce({ value: fakeBalance })
        .mockReturnValueOnce({ value: tokenIds[0] })
        .mockReturnValueOnce({ value: tokenIds[1] })
    } as unknown as NFT721Manager
    const storage = {} as unknown as StorageType
    const spyGet = jest.spyOn(NFTHandler, 'get').mockResolvedValue(nft)

    const nfts = await NFTHandler.getNFTListByOwner(
      nftManager,
      storage,
      owner,
      NFT_METADATA_FORMAT.IMAGE
    )

    expect(nfts.length).toBe(2)
    expect(nfts[0]).toBe(nft)
    expect(nfts[1]).toBe(nft)
    expect(spyGet).toBeCalledTimes(2)
  })
})

describe('NFTHandler change function', () => {
  it('Should throw error if the nftManager is not activate', async () => {
    const tokenId = 'fake-tokenId'
    const nftManager = {
      isActive: false
    } as unknown as NFT721Manager
    const storage = {} as StorageType
    await expect(
      NFTHandler.change({
        nftManager,
        storage,
        nftFormat: NFT_METADATA_FORMAT.IMAGE,
        tokenId
      })
    ).rejects.toThrow(errors.MUST_ACTIVATE)
  })

  it('Should throw error if the contract does not implement the function setTokenURI(uint256,string)', async () => {
    const tokenId = 'fake-tokenId'
    const contractAddr = 'fake-address'
    const nftManager = {
      isActive: true,
      contractAddr,
      implements: jest.fn().mockReturnValueOnce(false)
    } as unknown as NFT721Manager
    const storage = {} as StorageType

    await expect(
      NFTHandler.change({
        nftManager,
        storage,
        nftFormat: NFT_METADATA_FORMAT.IMAGE,
        tokenId
      })
    ).rejects.toThrow(
      errors.FUNCTION_NOT_IMPLEMENTED(
        contractAddr,
        'setTokenURI(uint256,string)'
      )
    )
  })

  it('Should return the transaction of the setTokenURI execution', async () => {
    const nftFormat = NFT_METADATA_FORMAT.JSON_WITH_IMAGE
    const tokenId = 'fake-tokenId'
    const image = 'fake-image'
    const nftMetadata = {} as NFTMetadata
    const fakeTransaction = { transactionResponse: { fake: 'value' } }
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest.fn().mockReturnValueOnce(fakeTransaction)
    } as unknown as NFT721Manager
    const storage = {} as unknown as StorageType
    const spyUploadData = jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(NFTHandler as any, 'uploadData')
      .mockImplementationOnce(() => jest.fn())

    const response = await NFTHandler.change({
      nftManager,
      storage,
      nftFormat,
      tokenId,
      image,
      nftMetadata
    })

    expect(spyUploadData).toBeCalled()
    expect(response).toBe(fakeTransaction)
  })
})

describe('NFTHandler create function', () => {
  it('Should throw error if the nftManager is not activate', async () => {
    const tokenId = 'fake-tokenId'
    const nftManager = {
      isActive: false
    } as unknown as NFT721Manager
    const storage = {} as StorageType
    await expect(
      NFTHandler.create({
        nftManager,
        storage,
        nftFormat: NFT_METADATA_FORMAT.IMAGE,
        address: '0x00',
        tokenId
      })
    ).rejects.toThrow(errors.MUST_ACTIVATE)
  })

  it.each([
    { tokenId: undefined, fn: 'safeMint(address,string)' },
    { tokenId: '1', fn: 'safeMint(address,uint256,string)' }
  ])(
    'Should throw error if the contract does not implement the function $fn',
    async ({ tokenId, fn }) => {
      const contractAddr = 'fake-address'
      const nftManager = {
        isActive: true,
        contractAddr,
        implements: jest.fn().mockReturnValueOnce(false)
      } as unknown as NFT721Manager
      const storage = {} as StorageType

      await expect(
        NFTHandler.create({
          nftManager,
          storage,
          nftFormat: NFT_METADATA_FORMAT.IMAGE,
          address: '0x00',
          tokenId
        })
      ).rejects.toThrow(errors.FUNCTION_NOT_IMPLEMENTED(contractAddr, fn))
    }
  )

  it('Should return the transaction of the safeMint execution', async () => {
    const nftFormat = NFT_METADATA_FORMAT.JSON_WITH_IMAGE
    const tokenId = 'fake-tokenId'
    const image = 'fake-image'
    const address = '0x00'
    const nftMetadata = {} as NFTMetadata
    const fakeTransaction = { transactionResponse: { fake: 'value' } }
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest.fn().mockReturnValueOnce(fakeTransaction)
    } as unknown as NFT721Manager
    const storage = {} as unknown as StorageType
    const spyUploadData = jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(NFTHandler as any, 'uploadData')
      .mockImplementationOnce(() => jest.fn())

    const response = await NFTHandler.create({
      nftManager,
      storage,
      nftFormat,
      address,
      tokenId,
      image,
      nftMetadata
    })

    expect(spyUploadData).toBeCalled()
    expect(response).toBe(fakeTransaction)
  })
})

describe('NFTHandler uploadData function', () => {
  it.each([
    {
      nftFormat: NFT_METADATA_FORMAT.IMAGE,
      errorMsg: 'image (encoded as base64)'
    },
    { nftFormat: NFT_METADATA_FORMAT.JSON, errorMsg: 'nftMetadata' },
    {
      nftFormat: NFT_METADATA_FORMAT.JSON_WITH_IMAGE,
      errorMsg: 'image (encoded as base64) or nftMetadata'
    }
  ])(
    'Should throw an error if the corresponding parameter is missing',
    async ({ nftFormat, errorMsg }) => {
      const storage = {} as unknown as StorageType

      await expect(
        NFTHandler['uploadData'](nftFormat, storage)
      ).rejects.toThrow(errors.MISSING_PARAM(errorMsg))
    }
  )

  it.each([
    {
      nftFormat: NFT_METADATA_FORMAT.IMAGE,
      methodsCalls: { storeMetaData: 0, storeBase64Image: 1 }
    },
    {
      nftFormat: NFT_METADATA_FORMAT.JSON,
      methodsCalls: { storeMetaData: 1, storeBase64Image: 0 }
    },
    {
      nftFormat: NFT_METADATA_FORMAT.JSON_WITH_IMAGE,
      methodsCalls: { storeMetaData: 1, storeBase64Image: 1 }
    }
  ])(
    'Should upload the data to the storage and return the tokenUri ($nftFormat)',
    async ({ nftFormat, methodsCalls }) => {
      const image = 'fake-image'
      const nftMetadata = {} as NFTMetadata
      const fakeUri = 'fake-uri'
      const storage = {
        storeBase64Image: jest.fn().mockReturnValueOnce(fakeUri),
        storeMetadata: jest.fn().mockReturnValueOnce(fakeUri)
      } as unknown as StorageType

      const response = await NFTHandler['uploadData'](
        nftFormat,
        storage,
        image,
        nftMetadata
      )

      expect(storage.storeMetadata).toBeCalledTimes(methodsCalls.storeMetaData)
      expect(storage.storeBase64Image).toBeCalledTimes(
        methodsCalls.storeBase64Image
      )
      expect(response).toBe(fakeUri)
    }
  )
})
