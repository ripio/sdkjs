/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from '@wagmi/core'
import { ethers } from 'ethers'

const configureChains = jest.fn().mockImplementation(() => {
  return {
    provider: jest.fn()
  }
})
const createClient = jest.fn().mockImplementation(() => {
  return {} as unknown as Client
})
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
  __resetCoreMocks
}
