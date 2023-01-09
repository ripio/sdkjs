import fs from 'fs/promises'
import {
  __resetIPFSMocks,
  __setMockAdd,
  __setMockCat
} from '../__mocks__/ipfs-http-client'
import StorageIpfs from '../StorageIpfs'
import ResourceIpfs from '../ResourceIpfs'
import * as ipfsUtils from '..//utils'
import errors from '../types/errors'

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

describe('StorageIpfs storeMetadata method', () => {
  it('Should add a file with its properties and return the uri', async () => {
    const spyStringify = jest.spyOn(JSON, 'stringify')
    const properties = { someProp: 'prop' }
    const expectedUri = 'ipfs://fake-cid'
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    ipfs['addFileToIpfs'] = jest.fn(() => Promise.resolve(expectedUri))
    const cid = await ipfs.storeMetadata(properties)
    expect(cid).toBe(expectedUri)
    expect(spyStringify).toBeCalledWith(properties)
    expect(ipfs['addFileToIpfs']).toBeCalled()
  })
})

describe('StorageIpfs storeFile method', () => {
  it('Should add a file with its properties and return the uri', async () => {
    const spyReadFile = jest.spyOn(fs, 'readFile').mockImplementation(jest.fn())
    const path = '/a/path'
    const expectedUri = 'ipfs://fake-cid'
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    ipfs['addFileToIpfs'] = jest.fn(() => Promise.resolve(expectedUri))
    const cid = await ipfs.storeFile(path)
    expect(cid).toBe(expectedUri)
    expect(spyReadFile).toBeCalledWith(path)
    expect(ipfs['addFileToIpfs']).toBeCalled()
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
    const cid = await ipfs['addFileToIpfs']('fake-image')
    expect(cid).toBe(expectedUri)
  })

  it('Should throw an error if ipfs.add throws an error', async () => {
    __setMockAdd(() => Promise.reject(Error('Some ifps error')))
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    await expect(ipfs['addFileToIpfs']('fake-image')).rejects.toThrow(
      errors.IPFS_ADD()
    )
  })
})

describe('StorageIpfs storeBase64Image method', () => {
  it('Should throw an error due not implemented method', () => {
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    expect(() => {
      ipfs.storeBase64Image('base64')
    }).toThrow('Method not implemented.')
  })
})
