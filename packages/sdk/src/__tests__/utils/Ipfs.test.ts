import {
  __resetIPFSMocks,
  __setMockAdd,
  __setMockAddAll,
  __setMockLs,
  __setMockCat,
  globSource
} from '../../__mocks__/ipfs-http-client'
import { Ipfs } from '../../utils/Ipfs'
import errors from '../../types/errors'

const spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
let ipfs: Ipfs
function createInstance() {
  ipfs = new Ipfs('http://fake-ipfs-url:5001')
}

describe('Ipfs constructor', () => {
  it('Should create a new instance', () => {
    const instance = new Ipfs('http://fake-ipfs-url:5001')
    expect(instance).toBeInstanceOf(Ipfs)
    expect(spyWarn).toBeCalledWith(
      'Deprecation notice: the Ipfs class is being deprecated. Use StorageIpfs instead.'
    )
  })

  it('Should throw error due not passing ipfsUrl', () => {
    expect(() => {
      new Ipfs()
    }).toThrowError(errors.IS_REQUIRED('ipfsUrl'))
  })
})

describe('Ipfs uploadImages method', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should throw error due to not passing path', async () => {
    createInstance()
    await expect(ipfs.uploadImages()).rejects.toThrow(
      errors.IS_REQUIRED('path')
    )
  })

  it('Should return a cid when uploading a directory of images', async () => {
    __setMockAddAll(function* () {
      yield { cid: 'fake-cid-1' }
      yield { cid: 'fake-cid-2' }
      yield { cid: 'fake-cid-directory' }
    })
    createInstance()
    const cid = await ipfs.uploadImages('/fake/path')
    expect(cid).toBe('fake-cid-directory')
  })

  it('Should return an error when directory does not exist', async () => {
    createInstance()
    const dirError = 'No such file or directory'
    globSource.mockImplementation(function () {
      throw new Error(dirError)
    })
    await expect(ipfs.uploadImages('/fake/path')).rejects.toThrow(dirError)
  })
})

describe('Ipfs storeAsset method', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should throw error due to not passing cidOrURI', async () => {
    createInstance()
    await expect(ipfs.storeAsset()).rejects.toThrow(
      errors.IS_REQUIRED('cidOrURI')
    )
  })

  it('Should store the asset with it properties and return the uri', async () => {
    const fakeCid = 'fake-cid'
    const expectedUri = 'ipfs://fake-cid/metadata.json'
    __setMockAdd(() => Promise.resolve({ cid: fakeCid }))
    createInstance()
    const cid = await ipfs.storeAsset('fake-image', { someProp: 'prop' })
    expect(cid).toBe(expectedUri)
  })

  it('Should store the asset without and return the uri', async () => {
    const fakeCid = 'fake-cid'
    const expectedUri = 'ipfs://fake-cid/metadata.json'
    __setMockAdd(() => Promise.resolve({ cid: fakeCid }))
    createInstance()
    const cid = await ipfs.storeAsset('fake-image')
    expect(cid).toBe(expectedUri)
  })

  it('Should throw an error if ipfs.add throws an error', async () => {
    __setMockAdd(() => Promise.reject(Error('Some ifps error')))
    createInstance()
    await expect(
      ipfs.storeAsset('fake-image', { someProp: 'prop' })
    ).rejects.toThrow(errors.IPFS_ADD())
  })
})

describe('Ipfs storeMetadata method', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should throw error due to not passing cidOrURI', async () => {
    createInstance()
    await expect(ipfs.storeMetadata()).rejects.toThrow(
      errors.IS_REQUIRED('properties')
    )
  })

  it('Should add a file with it properties and return the uri', async () => {
    const fakeCid = 'fake-cid'
    const expectedUri = 'ipfs://fake-cid/metadata.json'
    __setMockAdd(() => Promise.resolve({ cid: fakeCid }))
    createInstance()
    const cid = await ipfs.storeMetadata({ someProp: 'prop' })
    expect(cid).toBe(expectedUri)
  })

  it('Should throw an error if ipfs.add throws an error', async () => {
    __setMockAdd(() => Promise.reject(Error('Some ifps error')))
    createInstance()
    await expect(ipfs.storeMetadata({ someProp: 'prop' })).rejects.toThrow(
      errors.IPFS_ADD()
    )
  })
})

describe('Ipfs getDirectoryFiles method', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should throw error due to not passing ipfsPath', async () => {
    createInstance()
    await expect(ipfs.getDirectoryFiles()).rejects.toThrow(
      errors.IS_REQUIRED('ipfsPath')
    )
  })

  it('Should retrieve the files of the directory', async () => {
    const directoryFiles = [
      { cid: 'cid-1', path: 'path-1' },
      { cid: 'cid-2', path: 'path-2' }
    ]
    __setMockLs(function* () {
      yield* directoryFiles
    })
    createInstance()
    const links = await ipfs.getDirectoryFiles('fake-cid')
    expect(links).toEqual(directoryFiles)
  })

  it('Should throw an error if the directory does not exists', async () => {
    const dirError = 'No such file or directory'
    __setMockLs(function () {
      throw new Error(dirError)
    })
    createInstance()
    await expect(ipfs.getDirectoryFiles('fake-cid')).rejects.toThrow(dirError)
  })
})

describe('Ipfs getIPFS method', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should throw error due to not passing cidOrURI', async () => {
    createInstance()
    await expect(ipfs.getIPFS()).rejects.toThrow(errors.IS_REQUIRED('cidOrURI'))
  })

  it('Should retrieve the file from ipfs', async () => {
    const expected = new TextEncoder().encode('abc')
    __setMockCat(function* () {
      yield new TextEncoder().encode('a')
      yield new TextEncoder().encode('b')
      yield new TextEncoder().encode('c')
    })
    createInstance()
    const data = await ipfs.getIPFS('fake-cid')
    expect(data).toStrictEqual(expected)
  })
})

describe('Ipfs getIPFSString method', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should throw error due to not passing cidOrURI', async () => {
    createInstance()
    await expect(ipfs.getIPFSString()).rejects.toThrow(
      errors.IS_REQUIRED('cidOrURI')
    )
  })

  it('Should retrieve the string from ipfs', async () => {
    const expected = 'abc'
    __setMockCat(function* () {
      yield new TextEncoder().encode('a')
      yield new TextEncoder().encode('b')
      yield new TextEncoder().encode('c')
    })
    createInstance()
    const data = await ipfs.getIPFSString('fake-cid')
    expect(data).toStrictEqual(expected)
  })
})

describe('Ipfs getIPFSJSON method', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should throw error due to not passing cidOrURI', async () => {
    createInstance()
    await expect(ipfs.getIPFSJSON()).rejects.toThrow(
      errors.IS_REQUIRED('cidOrURI')
    )
  })

  it('Should retrieve the json from ipfs', async () => {
    const metadata = {
      image: 'ipfs://fake-uri/image.png',
      level: 0,
      name: 'RD'
    }
    __setMockCat(function* () {
      yield new TextEncoder().encode(JSON.stringify(metadata))
    })
    createInstance()
    const data = await ipfs.getIPFSJSON('fake-cid')
    expect(data).toEqual(metadata)
  })
})

describe('Ipfs getIPFSBase64 method', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should throw error due to not passing cidOrURI', async () => {
    createInstance()
    await expect(ipfs.getIPFSBase64()).rejects.toThrow(
      errors.IS_REQUIRED('cidOrURI')
    )
  })

  it('Should retrieve the base64 from ipfs', async () => {
    // base64 encoded "hello!" string
    const expected = btoa('hello!')
    __setMockCat(function* () {
      yield new TextEncoder().encode('hello!')
    })
    createInstance()
    const data = await ipfs.getIPFSBase64('fake-cid')
    expect(data).toStrictEqual(expected)
  })
})
