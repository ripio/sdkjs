/* eslint-disable @typescript-eslint/no-explicit-any */
import { EthereumClient } from '@web3modal/ethereum'

let walletConnectProviderMock = jest.fn()
const walletConnectProvider = jest.fn().mockImplementation(() => {
  return walletConnectProviderMock
})
function __setWalletConnectProvider(mock: any) {
  walletConnectProviderMock = mock
}

let modalConnectorsMock = jest.fn()
const modalConnectors = jest.fn().mockImplementation(() => {
  return modalConnectorsMock
})
function __setModalConnectors(mock: any) {
  modalConnectorsMock = mock
}

let ethereumClientMock = jest.fn() as unknown as typeof EthereumClient
const mockEthereumClient = jest.fn().mockImplementation(() => {
  return ethereumClientMock
})
function __setEthereumClient(mock: any) {
  ethereumClientMock = mock
}

export {
  walletConnectProvider,
  modalConnectors,
  __setWalletConnectProvider,
  __setEthereumClient,
  __setModalConnectors,
  mockEthereumClient as EthereumClient
}
