import ResourceHttp from '../../../nft/storage/ResourceHttp'

describe('ResourceHttp methods', () => {
  it('Should set the parsedData property', async () => {
    const data = new Uint8Array()
    const resource = new ResourceHttp(data)
    expect(resource.parsedData).toBeUndefined()
    await resource.parseData()
    expect(resource.parsedData).toBeDefined()
  })
})
