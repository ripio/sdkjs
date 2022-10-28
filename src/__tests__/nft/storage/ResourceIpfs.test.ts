import ResourceIpfs from '../../../nft/storage/ResourceIpfs'
import errors from '../../../types/errors'

describe('ResourceIpfs contructor', () => {
  it('Should create a new instance', () => {
    const resource = new ResourceIpfs([] as Uint8Array[])
    expect(resource).toBeInstanceOf(ResourceIpfs)
  })

  it('Should throw error due not passing data', () => {
    expect(() => {
      new ResourceIpfs()
    }).toThrowError(errors.IS_REQUIRED('data'))
  })
})

describe('ResourceIpfs methods', () => {
  it('Should retrieve an Uint8Array', () => {
    const expected = new TextEncoder().encode('abc')
    const data = [
      new Uint8Array(new TextEncoder().encode('a')),
      new Uint8Array(new TextEncoder().encode('b')),
      new Uint8Array(new TextEncoder().encode('c'))
    ]
    const resource = new ResourceIpfs(data)
    const result = resource.getBytesData()
    expect(result).toStrictEqual(expected)
  })

  it('Should retrieve a string', () => {
    const expected = 'abc'
    const spyGetBytesData = jest
      .spyOn(ResourceIpfs.prototype, 'getBytesData')
      .mockReturnValueOnce(new TextEncoder().encode(expected))
    const resource = new ResourceIpfs([] as Uint8Array[])
    const result = resource.getStringData()
    expect(result).toStrictEqual(expected)
    expect(spyGetBytesData).toBeCalled()
  })

  it('Should retrieve a json', () => {
    const expected = {
      image: 'ipfs://fake-uri/image.png',
      level: 0,
      name: 'RD'
    }
    const spyGetStringData = jest
      .spyOn(ResourceIpfs.prototype, 'getStringData')
      .mockReturnValueOnce(JSON.stringify(expected))
    const resource = new ResourceIpfs([] as Uint8Array[])
    const result = resource.getJsonData()
    expect(result).toStrictEqual(expected)
    expect(spyGetStringData).toBeCalled()
  })

  it('Sould retrieve a base64 string', () => {
    const expected = Buffer.from('hello!').toString('base64')
    const spyGetBytesData = jest
      .spyOn(ResourceIpfs.prototype, 'getBytesData')
      .mockReturnValueOnce(new TextEncoder().encode('hello!'))
    const resource = new ResourceIpfs([] as Uint8Array[])
    const result = resource.getBase64Data()
    expect(result).toStrictEqual(expected)
    expect(spyGetBytesData).toBeCalled()
  })
})
