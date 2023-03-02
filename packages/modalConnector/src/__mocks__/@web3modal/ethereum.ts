import { EthereumClient } from '@web3modal/ethereum'

const walletConnectProvider = jest.fn().mockImplementation(() => {
  return jest.fn()
})
const modalConnectors = jest.fn()

const mockEthereumClient = jest.fn().mockImplementation(() => {
  return jest.fn() as unknown as typeof EthereumClient
})

export {
  walletConnectProvider,
  modalConnectors,
  mockEthereumClient as EthereumClient
}
