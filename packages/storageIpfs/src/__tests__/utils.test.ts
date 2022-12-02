import { stripIpfsUriPrefix, ensureIpfsUriPrefix } from '../utils'

const fakeCid = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'

describe('Utils stripIpfsUriPrefix function', () => {
  it('Should return the input string with the `ipfs://` prefix stripped off', () => {
    expect(stripIpfsUriPrefix('ipfs://' + fakeCid)).toBe(fakeCid)
    expect(stripIpfsUriPrefix(fakeCid)).toBe(fakeCid)
  })
})

describe('Utils ensureIpfsUriPrefix function', () => {
  it('Should return the input string with the `ipfs://` prefix added if it was missing', () => {
    expect(ensureIpfsUriPrefix(fakeCid)).toBe('ipfs://' + fakeCid)
    expect(ensureIpfsUriPrefix('ipfs://' + fakeCid)).toBe('ipfs://' + fakeCid)
    expect(ensureIpfsUriPrefix('ipfs://ipfs/' + fakeCid)).toBe(
      'ipfs://' + fakeCid
    )
    expect(ensureIpfsUriPrefix('ipfs/' + fakeCid)).toBe('ipfs://' + fakeCid)
  })
})
