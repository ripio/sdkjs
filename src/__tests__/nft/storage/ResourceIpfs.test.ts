import ResourceIpfs from '../../../nft/storage/ResourceIpfs'

describe('ResourceIpfs contructor', () => {
  it('Should create a new instance', () => {
    const resource = new ResourceIpfs([] as Uint8Array[])
    expect(resource).toBeInstanceOf(ResourceIpfs)
  })
})

describe('ResourceIpfs methods', () => {
  it('Should set the parsedData property', async () => {
    const ipfsData = function* () {
      yield new TextEncoder().encode('a')
      yield new TextEncoder().encode('b')
      yield new TextEncoder().encode('c')
    }
    const resource = new ResourceIpfs(ipfsData())
    expect(resource.parsedData).toBeUndefined()
    await resource.parseData()
    expect(resource.parsedData).toBeDefined()
  })
})
