import {
  __resetIPFSMocks,
  __setMockCat
} from '../../../__mocks__/ipfs-http-client'
import StorageIpfs from '../../../nft/storage/StorageIpfs'
import ResourceIpfs from '../../../nft/storage/ResourseIpfs'
import errors from '../../../types/errors'

describe('StorageIpfs contructor', () => {
  it('Should create a new instance', () => {
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    expect(ipfs).toBeInstanceOf(StorageIpfs)
  })

  it('Should throw error due not passing url', () => {
    expect(() => {
      new StorageIpfs()
    }).toThrowError(errors.IS_REQUIRED('url'))
  })
})

describe('StorageIpfs methods', () => {
  beforeEach(() => {
    __resetIPFSMocks()
  })

  it('Should throw error due not passing cid', () => {
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    expect(ipfs.getData()).rejects.toThrow(errors.IS_REQUIRED('cid'))
  })

  it('Should retrieve a ResourceIpfs instance', async () => {
    __setMockCat(function* () {
      yield new TextEncoder().encode('a')
      yield new TextEncoder().encode('b')
      yield new TextEncoder().encode('c')
    })
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    const data = await ipfs.getData('fake-cid')
    expect(data).toBeInstanceOf(ResourceIpfs)
  })
})
