import { NFTMetadata } from '../types/interfaces'
import { NFTJsonImageFactory } from '../NFTJsonImageFactory'
import { NFT } from '../NFT'
import Resource from '../storage/Resource'
import StorageType from '../storage/StorageType'

describe('NFTJsonImageFactory', () => {
  it('Should return a new NFT', async () => {
    const tokenId = 'fake-tokenId'
    const fakeImage = 'fake-image'
    const fakeJson = { image: 'fake-image-uri' } as NFTMetadata
    const jsonResource = {
      getJsonData: jest.fn().mockResolvedValueOnce(fakeJson)
    } as unknown as Resource
    const imgResource = {
      getBase64Data: jest.fn().mockResolvedValueOnce(fakeImage)
    } as unknown as Resource
    const storage = {
      getData: jest.fn().mockResolvedValueOnce(imgResource)
    } as unknown as StorageType
    const nft = await NFTJsonImageFactory.createNFT(
      jsonResource,
      tokenId,
      storage
    )

    expect(nft).toBeInstanceOf(NFT)
    expect(nft.image).toBe(fakeImage)
    expect(nft.jsonData).toBe(fakeJson)
    expect(storage.getData).toBeCalledWith(fakeJson.image)
  })
})
