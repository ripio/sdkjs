/* eslint-disable @typescript-eslint/no-explicit-any */
import { EthereumClient } from '@web3modal/ethereum'

let w3mProviderMock = jest.fn()
const w3mProvider = jest.fn().mockImplementation(() => {
  return w3mProviderMock
})
function __setW3mProvider(mock: any) {
  w3mProviderMock = mock
}

let w3mConnectorsMock = jest.fn()
const w3mConnectors = jest.fn().mockImplementation(() => {
  return w3mConnectorsMock
})
function __setW3mConnectors(mock: any) {
  w3mConnectorsMock = mock
}

let ethereumClientMock = jest.fn() as unknown as typeof EthereumClient
const mockEthereumClient = jest.fn().mockImplementation(() => {
  return ethereumClientMock
})
function __setEthereumClient(mock: any) {
  ethereumClientMock = mock
}

export {
  w3mProvider,
  w3mConnectors,
  __setW3mProvider,
  __setEthereumClient,
  __setW3mConnectors,
  mockEthereumClient as EthereumClient
}
