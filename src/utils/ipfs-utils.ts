//////////////////////////////////////////////
// -------- URI helpers
//////////////////////////////////////////////

/**
 * @param {string} cidOrURI either a CID string, or a URI string of the form `ipfs://${cid}`
 * @returns the input string with the `ipfs://` prefix stripped off
 */
export function stripIpfsUriPrefix(cidOrURI: string): string {
  if (cidOrURI.startsWith('ipfs://')) {
    return cidOrURI.slice('ipfs://'.length)
  }
  return cidOrURI
}

/**
 * @param {string} cidOrURI either a CID string, or a URI string of the form `ipfs://${cid}`
 * @returns the input string with the `ipfs://` prefix added if it was missing
 */
export function ensureIpfsUriPrefix(cidOrURI: string): string {
  let uri = cidOrURI.toString()
  if (!uri.startsWith('ipfs://')) {
    uri = 'ipfs://' + cidOrURI
  }
  // Avoid the Nyan Cat bug (https://github.com/ipfs/go-ipfs/pull/7930)
  if (uri.startsWith('ipfs://ipfs/')) {
    uri = uri.replace('ipfs://ipfs/', 'ipfs://')
  }
  return uri
}
