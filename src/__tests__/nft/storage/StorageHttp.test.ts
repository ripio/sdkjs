import StorageHttp from '../../../nft/storage/StorageHttp'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import ResourceHttp from '../../../nft/storage/ResourceHttp'

describe('StorageHttp methods', () => {
  let mock: MockAdapter

  beforeAll(() => {
    mock = new MockAdapter(axios)
  })

  afterEach(() => {
    mock.reset()
  })

  it('prueba', async () => {
    const resourceId = 'http://test/test'
    mock.onGet(resourceId).reply(200, 'data')

    const httpStorage = new StorageHttp()
    const resource = await httpStorage.getData(resourceId)

    expect(resource).toBeInstanceOf(ResourceHttp)
  })
})
