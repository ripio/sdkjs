import ResourceHelper from '../../../__mocks__/helpers/ResourceHelper'

describe('Resource contructor', () => {
  it('Should create a new instance', () => {
    const resource = new ResourceHelper({})
    expect(resource).toBeInstanceOf(ResourceHelper)
  })
})

describe('ResourceIpfs methods', () => {
  it('Should call parseData if parsedData is undefined', async () => {
    const spyParseData = jest.spyOn(ResourceHelper.prototype, 'parseData')
    const resource = new ResourceHelper({})
    resource.setParsedData()
    expect(spyParseData).toBeCalled()
  })

  it('Should not call parseData if parsedData is not undefined', async () => {
    const spyParseData = jest.spyOn(ResourceHelper.prototype, 'parseData')
    const resource = new ResourceHelper({})
    resource.parsedData = new Uint8Array(1)
    resource.setParsedData()
    expect(spyParseData).not.toBeCalled()
  })

  it('Should retrieve an Uint8Array', async () => {
    const spySetParsedData = jest.spyOn(
      ResourceHelper.prototype,
      'setParsedData'
    )
    const resource = new ResourceHelper({})
    resource.parsedData = new Uint8Array(1)
    const result = await resource.getBytesData()
    expect(result).toBeInstanceOf(Uint8Array)
    expect(spySetParsedData).toBeCalled()
  })

  it('Should retrieve a string', async () => {
    const spySetParsedData = jest.spyOn(
      ResourceHelper.prototype,
      'setParsedData'
    )
    const expected = 'abc'
    const resource = new ResourceHelper({})
    resource.parsedData = new TextEncoder().encode(expected)
    const result = await resource.getStringData()
    expect(result).toStrictEqual(expected)
    expect(spySetParsedData).toBeCalled()
  })

  it('Should retrieve a json', async () => {
    const spySetParsedData = jest.spyOn(
      ResourceHelper.prototype,
      'setParsedData'
    )
    const expected = {
      image: 'ipfs://fake-uri/image.png',
      level: 0,
      name: 'RD'
    }
    const spyGetStringData = jest
      .spyOn(ResourceHelper.prototype, 'getStringData')
      .mockResolvedValueOnce(JSON.stringify(expected))
    const resource = new ResourceHelper({})
    const result = await resource.getJsonData()
    expect(result).toStrictEqual(expected)
    expect(spyGetStringData).toBeCalled()
    expect(spySetParsedData).not.toBeCalled()
  })

  it('Sould retrieve a base64 string', async () => {
    const spySetParsedData = jest.spyOn(
      ResourceHelper.prototype,
      'setParsedData'
    )
    const expected = Buffer.from('hello!').toString('base64')
    const resource = new ResourceHelper({})
    resource.parsedData = new TextEncoder().encode('hello!')
    const result = await resource.getBase64Data()
    expect(result).toStrictEqual(expected)
    expect(spySetParsedData).toBeCalled()
  })
})
