/* eslint-disable @typescript-eslint/no-explicit-any */
let web3ModalMock = {
  openModal: jest.fn(() => {})
}
const mockWeb3Modal = jest.fn().mockImplementation(() => {
  return web3ModalMock
})
function __setWeb3Modal(mock: any) {
  web3ModalMock = mock
}

function __resetHtmlMocks() {
  web3ModalMock = {
    openModal: jest.fn(() => {})
  }
}

export { mockWeb3Modal as Web3Modal, __setWeb3Modal, __resetHtmlMocks }
