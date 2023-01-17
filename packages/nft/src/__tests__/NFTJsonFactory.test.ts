import { NFTMetadata } from '../types/interfaces'
import { NFTJsonFactory } from '../NFTJsonFactory'
import { NFT } from '../NFT'
import Resource from '../storage/Resource'

describe('NFTJsonFactory', () => {
  it('Should return a new NFT', async () => {
    const tokenId = 'fake-tokenId'
    const fakeJson = {} as NFTMetadata
    const resource = {
      getJsonData: jest.fn().mockResolvedValueOnce(fakeJson)
    } as unknown as Resource

    const nft = await NFTJsonFactory.createNFT(resource, tokenId)
    expect(nft).toBeInstanceOf(NFT)
    expect(nft.jsonData).toBe(fakeJson)
  })
})
