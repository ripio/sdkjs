import { NFTJsonImageFactory } from './../NFTJsonImageFactory'
import { NFTJsonFactory } from './../NFTJsonFactory'
import { NFTImageFactory } from '../NFTImageFactory'
import { Resource } from '@ripio/sdk-nft'
import { NFTHandler } from './../NFTHandler'
import { errors, NFT721Manager } from '@ripio/sdk'
import StorageType from '../storage/StorageType'
import { NFT_METADATA_FORMAT } from '../types'
import { NFT } from '../NFT'

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
    ).rejects.toThrow(errors.TOKEN_URI_NOT_IMPLEMENTED(contractAddr))
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
      errors.TOKEN_OF_OWNER_BY_INDEX_NOT_IMPLEMENTED(contractAddr)
    )
  })

  it('Should throw error if nftManager.execute function fails with a non-out of bounds error', async () => {
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
    ).rejects.toThrow(errors.TRANSACTION_FAILED(fakeError))
  })

  it.each([
    NFT_METADATA_FORMAT.IMAGE,
    NFT_METADATA_FORMAT.JSON,
    NFT_METADATA_FORMAT.JSON_WITH_IMAGE
  ])('Should return no nft when owner has none', async format => {
    const owner = 'fake-address'
    const fakeError = {
      cause: {
        error: {
          body: 'VM Exception while processing transaction: revert ERC721Enumerable: owner index out of bounds'
        }
      }
    }
    const nft = {} as unknown as NFT
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest.fn().mockRejectedValueOnce(fakeError)
    } as unknown as NFT721Manager
    const storage = {} as unknown as StorageType
    const spyGet = jest.spyOn(NFTHandler, 'get').mockResolvedValue(nft)

    const nfts = await NFTHandler.getNFTListByOwner(
      nftManager,
      storage,
      owner,
      format
    )

    expect(nfts.length).toBe(0)
    expect(spyGet).not.toBeCalled()
  })

  it.each([
    NFT_METADATA_FORMAT.IMAGE,
    NFT_METADATA_FORMAT.JSON,
    NFT_METADATA_FORMAT.JSON_WITH_IMAGE
  ])('Should return nfts when owner has nfts', async format => {
    const owner = 'fake-address'
    const tokenIds = ['fake-tokenId', 'fake-tokenId-2']
    const fakeError = {
      cause: {
        error: {
          body: 'VM Exception while processing transaction: revert ERC721Enumerable: owner index out of bounds'
        }
      }
    }
    const nft = {} as unknown as NFT
    const nftManager = {
      isActive: true,
      implements: jest.fn().mockReturnValueOnce(true),
      execute: jest
        .fn()
        .mockReturnValueOnce({ value: tokenIds[0] })
        .mockReturnValueOnce({ value: tokenIds[1] })
        .mockRejectedValueOnce(fakeError)
    } as unknown as NFT721Manager
    const storage = {} as unknown as StorageType
    const spyGet = jest.spyOn(NFTHandler, 'get').mockResolvedValue(nft)

    const nfts = await NFTHandler.getNFTListByOwner(
      nftManager,
      storage,
      owner,
      format
    )

    expect(nfts.length).toBe(2)
    expect(nfts[0]).toBe(nft)
    expect(nfts[1]).toBe(nft)
    expect(spyGet).toBeCalledTimes(2)
  })
})
