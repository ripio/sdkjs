import {
  __resetIPFSMocks,
  __setMockCat
} from '../../../__mocks__/ipfs-http-client'
import StorageIpfs from '../../../nft/storage/StorageIpfs'
import ResourceIpfs from '../../../nft/storage/ResourceIpfs'
import * as ipfsUtils from '../../../utils/ipfs-utils'

describe('StorageIpfs contructor', () => {
  it('Should create a new instance', () => {
    const ipfs = new StorageIpfs('http://fake-ipfs-url:5001')
    expect(ipfs).toBeInstanceOf(StorageIpfs)
  })
})

describe('StorageIpfs methods', () => {
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
