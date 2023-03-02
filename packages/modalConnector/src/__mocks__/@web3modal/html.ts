const mockWeb3Modal = jest.fn().mockImplementation(() => {
  return {
    openModal: jest.fn(() => {})
  }
})

export { mockWeb3Modal as Web3Modal }
