import { NFTImageFactory } from '../NFTImageFactory'
import { NFT } from '../NFT'
import Resource from '../storage/Resource'

describe('NFTImageFactory', () => {
  it('Should return a new NFT', async () => {
    const tokenId = 'fake-tokenId'
    const fakeImage = 'fake-image'
    const resource = {
      getBase64Data: jest.fn().mockResolvedValueOnce(fakeImage)
    } as unknown as Resource

    const nft = await NFTImageFactory.createNFT(resource, tokenId)
    expect(nft).toBeInstanceOf(NFT)
    expect(nft.image).toBe(fakeImage)
  })
})
