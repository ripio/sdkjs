import { Signature, Wallet } from 'ethers'
import errors from '../../types/errors'
import {
  EIP2612DaiPermitTypedDataSigner,
  EIP2612PermitTypedDataSigner,
  EIP712TypedDataSigner
} from '../../utils/typed-data'
import * as etherUtils from 'ethers/lib/utils'
import { DaiPermitMessage, EIP2612PermitMessage } from '../../types/interfaces'

describe('EIP712TypedDataSigner class', () => {
  it('Should create a EIP712TypedDataSigner', () => {
    const domain = {
      name: 'Ethers.js',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    }
    const types = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    }
    const message = {
      owner: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      spender: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      value: '1',
      nonce: '1',
      deadline: '1'
    }

    const signer = new EIP712TypedDataSigner(domain, types, message)
    expect(signer).toBeInstanceOf(EIP712TypedDataSigner)
    expect(signer['domain']).toStrictEqual(domain)
    expect(signer['types']).toStrictEqual(types)
    expect(signer['message']).toStrictEqual(message)
  })

  it('Should call _signTypedData when calling the sign method and return a Signature', async () => {
    const mockSignature = {} as Signature
    jest.spyOn(etherUtils, 'splitSignature').mockReturnValueOnce(mockSignature)
    const domain = {
      name: 'Ethers.js',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    }
    const types = {
      Permit: [{ name: 'owner', type: 'address' }]
    }
    const message = {
      owner: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    }

    const signer = new EIP712TypedDataSigner(domain, types, message)
    const account = {
      _signTypedData: jest.fn(() => Promise.resolve('0x0')),
      provider: {}
    } as unknown as Wallet

    const signature = await signer.sign(account)

    expect(account._signTypedData).toBeCalledWith(domain, types, message)
    expect(signature).toStrictEqual(mockSignature)
  })

  it('Should throw an error when calling the sign method with a signer without a provider', async () => {
    const domain = {
      name: 'Ethers.js',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    }
    const types = {
      Permit: [{ name: 'owner', type: 'address' }]
    }
    const message = {
      owner: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    }

    const signer = new EIP712TypedDataSigner(domain, types, message)
    const account = {
      _signTypedData: jest.fn(() => Promise.resolve('0x0')),
      provider: undefined
    } as unknown as Wallet

    await expect(signer.sign(account)).rejects.toThrow(
      errors.SIGNER_WITHOUT_PROVIDER
    )
  })
})

describe('EIP2612DaiPermitTypedDataSigner class', () => {
  it('Should create the EIP2612DaiPermitTypedDataSigner', () => {
    const domain = {
      name: 'Ethers.js',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    }
    const message = {
      holder: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      spender: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      nonce: '1',
      expiry: '1'
    }
    const finalMessage = { ...message, allowed: true }

    const signer = new EIP2612DaiPermitTypedDataSigner(domain, message)
    expect(signer).toBeInstanceOf(EIP2612DaiPermitTypedDataSigner)
    expect(signer['domain']).toStrictEqual(domain)
    expect(signer['types']).toStrictEqual({
      Permit: [
        { name: 'holder', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'allowed', type: 'bool' }
      ]
    })
    expect(signer['message']).toStrictEqual(finalMessage)
  })

  it('Should create the EIP2612DaiPermitTypedDataSigner with a false allowed value', () => {
    const domain = {
      name: 'Ethers.js',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    }
    const message = {
      holder: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      spender: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      nonce: '1',
      expiry: '1',
      allowed: false
    }

    const signer = new EIP2612DaiPermitTypedDataSigner(domain, message)
    expect(signer).toBeInstanceOf(EIP2612DaiPermitTypedDataSigner)
    expect(signer['domain']).toStrictEqual(domain)
    expect(signer['types']).toStrictEqual({
      Permit: [
        { name: 'holder', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'allowed', type: 'bool' }
      ]
    })
    expect(signer['message']).toStrictEqual(message)
  })

  it('Should throw an error if the message does not have the required keys', () => {
    const domain = {
      name: 'Ethers.js',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    }
    const message = {
      owner: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      spender: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    } as unknown as DaiPermitMessage

    expect(() => new EIP2612DaiPermitTypedDataSigner(domain, message)).toThrow(
      errors.EIP2612_DAI_PERMIT_MESSAGE_INVALID
    )
  })
})

describe('EIP2612PermitTypedDataSigner class', () => {
  it('Should create the EIP2612PermitTypedDataSigner', () => {
    const domain = {
      name: 'Ethers.js',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    }
    const message = {
      owner: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      spender: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      value: '1',
      nonce: '1',
      deadline: '1'
    }

    const signer = new EIP2612PermitTypedDataSigner(domain, message)
    expect(signer).toBeInstanceOf(EIP2612PermitTypedDataSigner)
    expect(signer['domain']).toStrictEqual(domain)
    expect(signer['types']).toStrictEqual({
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    })
    expect(signer['message']).toStrictEqual(message)
  })

  it('Should throw an error if the message does not have the required keys', () => {
    const domain = {
      name: 'Ethers.js',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    }
    const message = {
      owner: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      spender: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    } as unknown as EIP2612PermitMessage

    expect(() => new EIP2612PermitTypedDataSigner(domain, message)).toThrow(
      errors.EIP2612_PERMIT_MESSAGE_INVALID
    )
  })
})
