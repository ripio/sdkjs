import {
  globSource,
  __resetIPFSMocks,
  __setMockAdd,
  __setMockAddAll,
  __setMockCat,
  __setMockLs
} from '../../../__mocks__/ipfs-http-client'
import StorageIpfs from '../../../nft/storage/StorageIpfs'
import ResourceIpfs from '../../../nft/storage/ResourceIpfs'
import * as ipfsUtils from '../../../utils/ipfs-utils'
import errors from '../../../types/errors'

describe('StorageIpfs contructor', () => {
  it('Should create a new instance', () => {
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    expect(ipfs).toBeInstanceOf(StorageIpfs)
  })
})

describe('StorageIpfs getData method', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should retrieve a ResourceIpfs instance', async () => {
    __setMockCat(function* () {
      yield new TextEncoder().encode('a')
      yield new TextEncoder().encode('b')
      yield new TextEncoder().encode('c')
    })
    const spyOnStripIpfsUriPrefix = jest.spyOn(ipfsUtils, 'stripIpfsUriPrefix')
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    const data = await ipfs.getData('fake-cid')
    expect(data).toBeInstanceOf(ResourceIpfs)
    expect(spyOnStripIpfsUriPrefix).toBeCalledWith('fake-cid')
  })
})

describe('StorageIpfs storeFiles method', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should return a cid when uploading a directory of images', async () => {
    __setMockAddAll(function* () {
      yield { cid: 'fake-cid-1' }
      yield { cid: 'fake-cid-2' }
      yield { cid: 'fake-cid-directory' }
    })
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    const cid = await ipfs.storeFiles('/fake/path')
    expect(cid).toBe('fake-cid-directory')
  })

  it('Should return an error when directory does not exist', async () => {
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    const dirError = 'No such file or directory'
    globSource.mockImplementation(function () {
      throw new Error(dirError)
    })
    await expect(ipfs.storeFiles('/fake/path')).rejects.toThrow(dirError)
  })
})

describe('StorageIpfs storeMetadata method', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should add a file with its properties and return the uri', async () => {
    const fakeCid = 'fake-cid'
    const expectedUri = 'ipfs://fake-cid'
    __setMockAdd(() => Promise.resolve({ cid: fakeCid }))
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    const cid = await ipfs.storeMetadata({ someProp: 'prop' })
    expect(cid).toBe(expectedUri)
  })

  it('Should throw an error if ipfs.add throws an error', async () => {
    __setMockAdd(() => Promise.reject(Error('Some ifps error')))
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    await expect(ipfs.storeMetadata({ someProp: 'prop' })).rejects.toThrow(
      errors.IPFS_ADD()
    )
  })
})

describe('StorageIpfs getDirectoryFiles method', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should retrieve the resource id files of the directory', async () => {
    const directoryFiles = [
      { cid: 'cid-1', path: 'path-1' },
      { cid: 'cid-2', path: 'path-2' }
    ]
    const expected = ['cid-1', 'cid-2']
    __setMockLs(function* () {
      yield* directoryFiles
    })
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    const links = await ipfs.getDirectoryFiles('fake-cid')
    expect(links).toEqual(expected)
  })

  it('Should throw an error if the directory does not exists', async () => {
    const dirError = 'No such file or directory'
    __setMockLs(function () {
      throw new Error(dirError)
    })
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    await expect(ipfs.getDirectoryFiles('fake-cid')).rejects.toThrow(dirError)
  })
})

describe('StorageIpfs addFileToIpfs method', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should store the file and return the uri', async () => {
    const fakeCid = 'fake-cid'
    const expectedUri = 'ipfs://fake-cid'
    __setMockAdd(() => Promise.resolve({ cid: fakeCid }))
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    const cid = await ipfs.addFileToIpfs('fake-image')
    expect(cid).toBe(expectedUri)
  })

  it('Should throw an error if ipfs.add throws an error', async () => {
    __setMockAdd(() => Promise.reject(Error('Some ifps error')))
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    await expect(ipfs.addFileToIpfs('fake-image')).rejects.toThrow(
      errors.IPFS_ADD()
    )
  })
})
