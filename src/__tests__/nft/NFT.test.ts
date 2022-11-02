import { NftMetadata } from './../../types/interfaces'
import { NFT } from '../../nft'

const base_nft_metadata: NftMetadata = {
  name: 'fake-name',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  image: 'ipfs://fake-uri',
  attributes: [
    {
      trait_type: 'fake-trait',
      value: 'fake-value'
    },
    {
      trait_type: 'fake-trait-2',
      value: 'fake-value'
    }
  ]
}

describe('NFT constructor', () => {
  it('Should instanciate the NFT', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT({
      tokenId
    })
    expect(nft).toBeDefined()
    expect(nft).toBeInstanceOf(NFT)
  })

  it('Should save the tokenId and nft metadata', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT({
      tokenId,
      nftMetadata: base_nft_metadata
    })
    expect(nft.tokenId).toBe(tokenId)
    expect(nft.name).toBe(base_nft_metadata.name)
    expect(nft.description).toBe(base_nft_metadata.description)
    expect(nft.imageUri).toBe(base_nft_metadata.image)
    expect(nft.attributes).toBe(base_nft_metadata.attributes)
    expect(nft.jsonData).toBe(base_nft_metadata)
  })

  it('Should save the tokenId and nft metadata (attributes as traits)', () => {
    const tokenId = 'fake-tokenId'
    const nftMetadata = {
      ...base_nft_metadata,
      traits: base_nft_metadata.attributes
    }
    delete nftMetadata.attributes
    const nft = new NFT({
      tokenId,
      nftMetadata
    })
    expect(nft.attributes).toBe(nftMetadata.traits)
  })

  it('Should save the tokenId and nft metadata (attributes as properties)', () => {
    const tokenId = 'fake-tokenId'
    const nftMetadata = {
      ...base_nft_metadata,
      properties: base_nft_metadata.attributes
    }
    delete nftMetadata.attributes
    const nft = new NFT({
      tokenId,
      nftMetadata
    })
    expect(nft.attributes).toBe(nftMetadata.properties)
  })
})

describe('Getters of NFT', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should return the tokenId when calling tokenId', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT({
      tokenId,
      nftMetadata: base_nft_metadata
    })
    expect(nft.tokenId).toBe(tokenId)
  })

  it('should return the name when calling name', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT({
      tokenId,
      nftMetadata: base_nft_metadata
    })
    expect(nft.name).toBe(base_nft_metadata.name)
  })

  it('should return the description when calling description', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT({
      tokenId,
      nftMetadata: base_nft_metadata
    })
    expect(nft.description).toBe(base_nft_metadata.description)
  })

  it('should return the imageUri when calling imageUri', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT({
      tokenId,
      nftMetadata: base_nft_metadata
    })
    expect(nft.imageUri).toBe(base_nft_metadata.image)
  })

  it('should return the attributes when calling attributes', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT({
      tokenId,
      nftMetadata: base_nft_metadata
    })
    expect(nft.attributes).toBe(base_nft_metadata.attributes)
  })

  it('should return the image when calling image', () => {
    const tokenId = 'fake-tokenId'
    const fakeImage = 'fake-image'
    const nft = new NFT({
      tokenId,
      nftMetadata: base_nft_metadata
    })
    nft['_image'] = fakeImage
    expect(nft.image).toBe(fakeImage)
  })

  it('should return the jsonData when calling jsonData', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT({
      tokenId,
      nftMetadata: base_nft_metadata
    })
    expect(nft.jsonData).toBe(base_nft_metadata)
  })
})
