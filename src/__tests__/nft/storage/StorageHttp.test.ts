import StorageHttp from '../../../nft/storage/StorageHttp'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import ResourceHttp from '../../../nft/storage/ResourceHttp'

describe('StorageHttp getData method', () => {
  let mock: MockAdapter

  beforeAll(() => {
    mock = new MockAdapter(axios)
  })

  afterEach(() => {
    mock.reset()
  })

  it('Should retrieve a ResourceHttp instance', async () => {
    const resourceId = 'http://test/test'
    mock.onGet(resourceId).reply(200, 'data')

    const httpStorage = new StorageHttp()
    const resource = await httpStorage.getData(resourceId)

    expect(resource).toBeInstanceOf(ResourceHttp)
  })
})

describe('StorageHttp storeFile method', () => {
  it('Should throw an error due not implemented method', () => {
    const storage = new StorageHttp()
    expect(() => {
      storage.storeFile('filepath')
    }).toThrow('Method not implemented.')
  })
})

describe('StorageHttp storeMetadata method', () => {
  it('Should throw an error due not implemented method', () => {
    const storage = new StorageHttp()
    expect(() => {
      storage.storeMetadata({ test: 'test' })
    }).toThrow('Method not implemented.')
  })
})
