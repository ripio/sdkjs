import ResourceIpfs from '../../../nft/storage/ResourseIpfs'
import errors from '../../../types/errors'

describe('ResourceIpfs contructor', () => {
  it('Should create a new instance', () => {
    const resourse = new ResourceIpfs([] as Uint8Array[])
    expect(resourse).toBeInstanceOf(ResourceIpfs)
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
    const resourse = new ResourceIpfs(data)
    const result = resourse.getBytesData()
    expect(result).toStrictEqual(expected)
  })

  it('Should retrieve a string', () => {
    const expected = 'abc'
    const spyGetBytesData = jest
      .spyOn(ResourceIpfs.prototype, 'getBytesData')
      .mockReturnValueOnce(new TextEncoder().encode(expected))
    const resourse = new ResourceIpfs([] as Uint8Array[])
    const result = resourse.getStringData()
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
    const resourse = new ResourceIpfs([] as Uint8Array[])
    const result = resourse.getJsonData()
    expect(result).toStrictEqual(expected)
    expect(spyGetStringData).toBeCalled()
  })

  it('Sould retrieve a base64 string', () => {
    const expected = Buffer.from('hello!').toString('base64')
    const spyGetBytesData = jest
      .spyOn(ResourceIpfs.prototype, 'getBytesData')
      .mockReturnValueOnce(new TextEncoder().encode('hello!'))
    const resourse = new ResourceIpfs([] as Uint8Array[])
    const result = resourse.getBase64Data()
    expect(result).toStrictEqual(expected)
    expect(spyGetBytesData).toBeCalled()
  })
})
