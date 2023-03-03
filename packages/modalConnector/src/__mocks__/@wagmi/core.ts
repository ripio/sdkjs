/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from '@wagmi/core'
import { ethers } from 'ethers'

let mockProvider = jest.fn()
const configureChains = jest.fn().mockImplementation(() => {
  return {
    provider: mockProvider
  }
})
function __setProvider(mock: any) {
  mockProvider = mock
}

let mockClient = {} as unknown as Client
const createClient = jest.fn().mockImplementation(() => {
  return mockClient
})
function __setClient(mock: any) {
  mockClient = mock
}

const getProvider = jest.fn().mockImplementation(() => {
  return {} as unknown as ethers.providers.StaticJsonRpcProvider
})
const getNetwork = jest.fn().mockImplementation(() => {
  return {
    chain: { id: '1' }
  }
})
const switchNetwork = jest.fn()
const disconnect = jest.fn()
const watchAccount = jest.fn()
const watchNetwork = jest.fn()
const watchProvider = jest.fn()

let mockConnected = false
let mockFetchSigner = {} as ethers.providers.JsonRpcSigner

const getAccount = jest.fn().mockImplementation(() => {
  return {
    isConnected: mockConnected
  }
})

function __setAccountConnected(connected: boolean) {
  mockConnected = connected
}

const fetchSigner = jest.fn().mockImplementation(() => {
  if (mockFetchSigner instanceof Error) {
    throw mockFetchSigner
  } else {
    return mockFetchSigner
  }
})

function __setFetchSigner(mock: any) {
  mockFetchSigner = mock
}

function __resetCoreMocks() {
  mockConnected = false
  mockFetchSigner = {} as ethers.providers.JsonRpcSigner
  mockProvider = jest.fn()
  mockClient = {} as unknown as Client
}

export {
  configureChains,
  createClient,
  getProvider,
  getNetwork,
  disconnect,
  switchNetwork,
  getAccount,
  fetchSigner,
  watchAccount,
  watchNetwork,
  watchProvider,
  __setAccountConnected,
  __setFetchSigner,
  __setProvider,
  __setClient,
  __resetCoreMocks
}
