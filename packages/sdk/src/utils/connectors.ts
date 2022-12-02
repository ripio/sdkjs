import { utils } from 'ethers'
import { ChainIds } from '../types/enums'
import BrowserWeb3Connector from '../connectors/BrowserWeb3Connector'
import JsonRPCWeb3Connector from '../connectors/JsonRPCWeb3Connector'
import errorTypes from '../types/errors'

/**
 * get a provider to connect to the blockchain
 * @param  {string} providerUrl
 * @param  {string} privateKey
 * @return {AbstractWeb3Connector} returns an AbstractWeb3Connector instance, could be JsonRPCWeb3Connector or BrowserWeb3Connector,
 * depending on the given parameters.
 */
export function getConnector({
  providerUrl,
  privateKey
}: {
  providerUrl?: string
  privateKey?: string
} = {}): JsonRPCWeb3Connector | BrowserWeb3Connector {
  const isCustom = !!providerUrl
  const connector = isCustom
    ? new JsonRPCWeb3Connector(providerUrl, privateKey)
    : new BrowserWeb3Connector()
  return connector
}

/**
 * It takes a nonce, a signature, and an expected address, and returns true if the signature is valid
 * for the nonce and the expected address
 * @param {string} nonce - A random string that is used to prevent replay attacks.
 * @param {string} signature - The signature of the message.
 * @param {string} expectedAddress - The address you expect the signature to be from.
 * @returns True if the address passed is equal to the address of the signer.
 */
export function verifyMessage(
  nonce: string,
  signature: string,
  expectedAddress: string
): boolean {
  let actualAddress
  try {
    actualAddress = utils.verifyMessage(nonce, signature)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw errorTypes.INVALID_SIGNATURE(new Error(error.reason))
  }
  return actualAddress.toLowerCase() === expectedAddress.toLowerCase()
}

/**
 * It returns the minimum number of confirmations required for a transaction to be considered valid
 * @param {number} chainId - The chain ID of the network you're using.
 * @returns The minimum number of confirmations required for a transaction to be considered valid.
 */
export function getMinConfirmations(chainId: number): number {
  switch (chainId) {
    // uncomment when the chainId is available
    // case chainIds.RIPIOCHAIN:
    //   return 3
    case ChainIds.RIPIOCHAIN_TESTNET:
      return 1
    case ChainIds.ETH:
      return 11
    case ChainIds.RINKEBY:
      return 1
    case ChainIds.ROPSTEN:
      return 1
    case ChainIds.GOERLI:
      return 1
    case ChainIds.KOVAN:
      return 1
    case ChainIds.POLYGON:
      return 14
    case ChainIds.MUMBAI:
      return 1
    case ChainIds.BINANCE:
      return 5
    case ChainIds.BINANCE_TESTNET:
      return 1
    default:
      return 10
  }
}
