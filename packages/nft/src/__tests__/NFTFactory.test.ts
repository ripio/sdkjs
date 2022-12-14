import { NftMetadata } from '../types/interfaces'
import { NFT, NFTFactory, NFT_METADATA_FORMAT } from '../'
import Resource from '../storage/Resource'
import StorageType from '../storage/StorageType'
import { errors, NFT721Manager } from '@ripio/sdk'

describe('NFTFactory constructor', () => {
  it('Should instanciate the NFTFactory', () => {
    const nftManager = {
      isActive: true
    } as NFT721Manager
    const storage = {} as StorageType
    const nftFactory = new NFTFactory(
      nftManager,
      storage,
      NFT_METADATA_FORMAT.IMAGE
    )
    expect(nftFactory).toBeDefined()
    expect(nftFactory).toBeInstanceOf(NFTFactory)
  })

  it('Should throw error if the nftManager is not activate', async () => {
    const nftManager = {
      isActive: false
    } as unknown as NFT721Manager
    const storage = {} as StorageType
    expect(() => {
      new NFTFactory(nftManager, storage, NFT_METADATA_FORMAT.IMAGE)
    }).toThrowError(errors.MUST_ACTIVATE)
  })

  it('Should save the nftManager, storage and nftFormat', () => {
    const nftManager = {
      isActive: true
    } as NFT721Manager
    const storage = {} as StorageType
    const nftFactory = new NFTFactory(
      nftManager,
      storage,
      NFT_METADATA_FORMAT.IMAGE
    )
    expect(nftFactory['_manager']).toBe(nftManager)
    expect(nftFactory['_storage']).toBe(storage)
    expect(nftFactory['_nftFormat']).toBe(NFT_METADATA_FORMAT.IMAGE)
  })
})

describe('NFTFactory createNFT function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
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
    const nftFactory = new NFTFactory(
      nftManager,
      storage,
      NFT_METADATA_FORMAT.IMAGE
    )
    await expect(nftFactory.createNFT(tokenId)).rejects.toThrow(
      errors.TOKEN_URI_NOT_IMPLEMENTED(contractAddr)
    )
  })

  it('Should throw error if _manager.execute function fails', async () => {
    const tokenId = 'fake-tokenId'
    const fakeError = new Error('fake-error')
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest.fn().mockRejectedValueOnce(fakeError)
    } as unknown as NFT721Manager
    const storage = {} as StorageType
    const nftFactory = new NFTFactory(
      nftManager,
      storage,
      NFT_METADATA_FORMAT.IMAGE
    )
    expect(async () => await nftFactory.createNFT(tokenId)).rejects.toThrow(
      errors.GET_TOKEN_URI(tokenId, fakeError)
    )
  })

  it('Should return a new NFT (IMAGE format)', async () => {
    const tokenId = 'fake-tokenId'
    const fakeImage = 'fake-image'
    const tokenUri = 'fake-uri'
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest.fn().mockReturnValueOnce({ value: tokenUri })
    } as unknown as NFT721Manager
    const resource = {
      getBase64Data: jest.fn().mockResolvedValueOnce(fakeImage)
    } as unknown as Resource
    const storage = {
      getData: jest.fn().mockResolvedValue(resource)
    } as unknown as StorageType
    const nftFactory = new NFTFactory(
      nftManager,
      storage,
      NFT_METADATA_FORMAT.IMAGE
    )
    const nft = await nftFactory.createNFT(tokenId)
    expect(nft).toBeInstanceOf(NFT)
    expect(nft.image).toBe(fakeImage)
    expect(storage.getData).toBeCalledWith(tokenUri)
  })

  it('Should return a new NFT (JSON format)', async () => {
    const tokenId = 'fake-tokenId'
    const fakeJson = {} as NftMetadata
    const tokenUri = 'fake-uri'
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest.fn().mockReturnValueOnce({ value: tokenUri })
    } as unknown as NFT721Manager
    const resource = {
      getJsonData: jest.fn().mockResolvedValueOnce(fakeJson)
    } as unknown as Resource
    const storage = {
      getData: jest.fn().mockResolvedValue(resource)
    } as unknown as StorageType
    const nftFactory = new NFTFactory(
      nftManager,
      storage,
      NFT_METADATA_FORMAT.JSON
    )
    const nft = await nftFactory.createNFT(tokenId)
    expect(nft).toBeInstanceOf(NFT)
    expect(nft.jsonData).toBe(fakeJson)
    expect(storage.getData).toBeCalledWith(tokenUri)
  })

  it('Should return a new NFT (JSON_WITH_IMAGE format)', async () => {
    const tokenId = 'fake-tokenId'
    const fakeImage = 'fake-image'
    const fakeJson = { image: 'fake-image-uri' } as NftMetadata
    const tokenUri = 'fake-uri'
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest.fn().mockReturnValueOnce({ value: tokenUri })
    } as unknown as NFT721Manager
    const jsonResource = {
      getJsonData: jest.fn().mockResolvedValueOnce(fakeJson)
    } as unknown as Resource
    const imgResource = {
      getBase64Data: jest.fn().mockResolvedValueOnce(fakeImage)
    } as unknown as Resource
    const storage = {
      getData: jest
        .fn()
        .mockResolvedValueOnce(jsonResource)
        .mockResolvedValueOnce(imgResource)
    } as unknown as StorageType
    const nftFactory = new NFTFactory(
      nftManager,
      storage,
      NFT_METADATA_FORMAT.JSON_WITH_IMAGE
    )
    const nft = await nftFactory.createNFT(tokenId)
    expect(nft).toBeInstanceOf(NFT)
    expect(nft.image).toBe(fakeImage)
    expect(nft.jsonData).toBe(fakeJson)
    expect(storage.getData).toBeCalledTimes(2)
    expect(storage.getData).toHaveBeenNthCalledWith(1, tokenUri)
    expect(storage.getData).toHaveBeenNthCalledWith(2, fakeJson.image)
  })
})
