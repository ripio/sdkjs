import { BrowserWeb3Connector, JsonRPCWeb3Connector } from '../../connectors'
import {
  getConnector,
  getMinConfirmations,
  verifyMessage
} from '../../utils/connectors'
import errorTypes from '../../types/errors'
import { utils } from 'ethers'

const mockVerify = (mock: jest.Mock) => {
  return mock
}

jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers')

  return {
    __esModule: true,
    ...originalModule,
    utils: {
      verifyMessage: () => mockVerify
    }
  }
})

describe('getConnectors tests', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should instantiate a JsonRPCWeb3Connector when calling getConnector with provider and chain', () => {
    const connector = getConnector({
      providerUrl: 'http://'
    })
    expect(connector).toBeInstanceOf(JsonRPCWeb3Connector)
  })

  it('should instantiate a BrowserWeb3Connector when calling getConnector with provider and chain', () => {
    const connector = getConnector()
    expect(connector).toBeInstanceOf(BrowserWeb3Connector)
  })

  it('Should verify a message even if the address is in upper/lower case', async () => {
    const msg = 'signed msg + nonce'
    const addr = '0x7860FF546bE31dec5A022BF0E38B4D550eB78796'
    const addrUpper = addr.toUpperCase()
    const addrLower = addr.toLowerCase()
    const mockVerification = jest.fn()
    mockVerification
      .mockReturnValueOnce(addrUpper)
      .mockReturnValueOnce(addrUpper)
      .mockReturnValueOnce(addrLower)
      .mockReturnValueOnce(addrLower)
    utils.verifyMessage = mockVerification
    mockVerify(mockVerification)
    const verified = verifyMessage(msg, 'signature', addrLower)
    const verified2 = verifyMessage(msg, 'signature', addrUpper)
    const verified3 = verifyMessage(msg, 'signature', addrUpper)
    const verified4 = verifyMessage(msg, 'signature', addrLower)
    expect(verified).toBe(true)
    expect(verified2).toBe(true)
    expect(verified3).toBe(true)
    expect(verified4).toBe(true)
  })

  it('Should verify a message from a signature and check the address', async () => {
    const msg = 'signed msg + nonce'
    const signature = 'fake-signature'
    const mockVerification = jest.fn()
    mockVerification.mockReturnValueOnce(
      '0x7860FF546bE31dec5A022BF0E38B4D550eB78796'
    )
    utils.verifyMessage = mockVerification
    mockVerify(mockVerification)
    const verified = verifyMessage(
      msg,
      signature,
      '0x7860FF546bE31dec5A022BF0E38B4D550eB78796'
    )
    expect(verified).toBe(true)
  })

  it('Should fail when verifying a message due to a message changed', async () => {
    const signature = 'fake-signature'
    const mockVerification = jest.fn()
    // when the message/nonce changes, but is a valid signature, the result address is different
    mockVerification.mockReturnValueOnce(
      '0xAAAAFF546bE31dec5A022BF0E38B4D550eB71111'
    )
    utils.verifyMessage = mockVerification
    mockVerify(mockVerification)
    const verified = verifyMessage(
      'signed msg + nonce 2',
      signature,
      '0x7860FF546bE31dec5A022BF0E38B4D550eB78796'
    )
    expect(verified).toBe(false)
  })

  it('Should fail when verifying a message due to different address expected', async () => {
    const msg = 'signed msg + nonce'
    const signature = 'fake-signature'
    const mockVerification = jest.fn()
    mockVerification.mockReturnValueOnce(
      '0x7860FF546bE31dec5A022BF0E38B4D550eB78796'
    )
    utils.verifyMessage = mockVerification
    mockVerify(mockVerification)
    const verified = verifyMessage(
      msg,
      signature,
      '0x1111111111111dec5A022BF0E38B4D550eB78791'
    )
    expect(verified).toBe(false)
  })

  it('Should throw an error if an invalid signature is provided', () => {
    const mockVerification = jest.fn()
    mockVerification.mockImplementationOnce(() => {
      throw { reason: 'Invalid signature...' }
    })
    utils.verifyMessage = mockVerification
    mockVerify(mockVerification)
    expect(() =>
      verifyMessage(
        'signed msg + nonce',
        'fake-bad-signature',
        '0x7860FF546bE31dec5A022BF0E38B4D550eB78796'
      )
    ).toThrow(errorTypes.INVALID_SIGNATURE(new Error('Invalid signature...')))
  })
})

describe('getConnectors tests', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Should return the default value when env var is not defined and the chain is not in the switch statement', () => {
    expect(getMinConfirmations(999)).toBe(10)
  })

  it('Should return the corresponding value when calling with the chain', () => {
    expect(getMinConfirmations(100)).toBe(1)
    expect(getMinConfirmations(1)).toBe(11)
    expect(getMinConfirmations(4)).toBe(1)
    expect(getMinConfirmations(3)).toBe(1)
    expect(getMinConfirmations(5)).toBe(1)
    expect(getMinConfirmations(42)).toBe(1)
    expect(getMinConfirmations(137)).toBe(14)
    expect(getMinConfirmations(80001)).toBe(1)
    expect(getMinConfirmations(56)).toBe(5)
    expect(getMinConfirmations(97)).toBe(1)
  })
})
