import { NftMetadata } from './../../types/interfaces'
import { NFT } from '../../nft'
import Resource from '../../nft/storage/Resource'
import StorageType from '../../nft/storage/StorageType'
import errors from '../../types/errors'

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
    const nft = new NFT(tokenId, base_nft_metadata)
    expect(nft).toBeDefined()
    expect(nft).toBeInstanceOf(NFT)
  })

  it('Should throw error due to not passing tokenId', async () => {
    expect(() => {
      new NFT(undefined, base_nft_metadata)
    }).toThrowError(errors.IS_REQUIRED('tokenId'))
  })

  it('Should throw error due to not passing nftMetadata', async () => {
    const tokenId = 'fake-tokenId'
    expect(() => {
      new NFT(tokenId)
    }).toThrowError(errors.IS_REQUIRED('nftMetadata'))
  })

  it('Should save the tokenId and nft metadata', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT(tokenId, base_nft_metadata)
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
    const nft = new NFT(tokenId, nftMetadata)
    expect(nft.attributes).toBe(nftMetadata.traits)
  })

  it('Should save the tokenId and nft metadata (attributes as properties)', () => {
    const tokenId = 'fake-tokenId'
    const nftMetadata = {
      ...base_nft_metadata,
      properties: base_nft_metadata.attributes
    }
    delete nftMetadata.attributes
    const nft = new NFT(tokenId, nftMetadata)
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
    const nft = new NFT(tokenId, base_nft_metadata)
    expect(nft.tokenId).toBe(tokenId)
  })

  it('should return the name when calling name', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT(tokenId, base_nft_metadata)
    expect(nft.name).toBe(base_nft_metadata.name)
  })

  it('should return the description when calling description', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT(tokenId, base_nft_metadata)
    expect(nft.description).toBe(base_nft_metadata.description)
  })

  it('should return the imageUri when calling imageUri', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT(tokenId, base_nft_metadata)
    expect(nft.imageUri).toBe(base_nft_metadata.image)
  })

  it('should return the attributes when calling attributes', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT(tokenId, base_nft_metadata)
    expect(nft.attributes).toBe(base_nft_metadata.attributes)
  })

  it('should return the image when calling image', () => {
    const tokenId = 'fake-tokenId'
    const fakeImage = 'fake-image'
    const nft = new NFT(tokenId, base_nft_metadata)
    nft['_image'] = fakeImage
    expect(nft.image).toBe(fakeImage)
  })

  it('should return the jsonData when calling jsonData', () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT(tokenId, base_nft_metadata)
    expect(nft.jsonData).toBe(base_nft_metadata)
  })
})

describe('NFT fetchBase64Image function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('Should throw error due to not passing storageType', async () => {
    const tokenId = 'fake-tokenId'
    const nft = new NFT(tokenId, base_nft_metadata)
    await expect(nft.fetchBase64Image()).rejects.toThrow(
      errors.IS_REQUIRED('storageType')
    )
  })

  it('Should save the base64 on image attribute', async () => {
    const tokenId = 'fake-tokenId'
    const fakeImage = 'fake-image'
    const resource: Resource = {
      data: '',
      getStringData: jest.fn(),
      getBytesData: jest.fn(),
      getBase64Data: jest.fn(() => {
        return fakeImage
      }),
      getJsonData: jest.fn(),
    } 
    const storage: StorageType = {
      storage: '',
      getData: jest.fn().mockResolvedValue(resource)
    } 
    const nft = new NFT(tokenId, base_nft_metadata)
    await nft.fetchBase64Image(storage)
    expect(nft.image).toBe(fakeImage)
    expect(storage.getData).toBeCalledWith(base_nft_metadata.image)
  })
})
