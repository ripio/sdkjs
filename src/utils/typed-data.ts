/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signature, Wallet, ethers } from 'ethers'
import { splitSignature } from 'ethers/lib/utils'
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import errors from '../types/errors'
import { DaiPermitMessage, EIP2612PermitMessage } from '../types/interfaces'

export class EIP712TypedDataSigner {
  protected domain: TypedDataDomain
  protected types: Record<string, Array<TypedDataField>>
  protected message: Record<string, any>

  constructor(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    message: Record<string, any>
  ) {
    this.domain = domain
    this.types = types
    this.message = message
  }

  /**
   * It takes a signer and returns the signature of the typed data.
   * @param {Wallet | ethers.providers.JsonRpcSigner} signer - The wallet or signer to sign the message
   * with.
   * @returns A signature object
   */
  async sign(
    signer: Wallet | ethers.providers.JsonRpcSigner
  ): Promise<Signature> {
    if (!signer.provider) throw errors.SIGNER_WITHOUT_PROVIDER

    const rawSignature = await signer._signTypedData(
      this.domain,
      this.types,
      this.message
    )
    return splitSignature(rawSignature)
  }
}

export class EIP2612PermitTypedDataSigner extends EIP712TypedDataSigner {
  constructor(domain: TypedDataDomain, message: EIP2612PermitMessage) {
    // throw error if message doesn't contain the required fields
    if (
      !(
        'owner' in message &&
        'spender' in message &&
        'value' in message &&
        'nonce' in message &&
        'deadline' in message
      )
    )
      throw errors.EIP2612_PERMIT_MESSAGE_INVALID

    const types: Record<string, TypedDataField[]> = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    }

    super(domain, types, message)
  }
}

export class EIP2612DaiPermitTypedDataSigner extends EIP712TypedDataSigner {
  constructor(domain: TypedDataDomain, message: DaiPermitMessage) {
    // throw error if message doesn't contain the required fields
    if (
      !(
        'holder' in message &&
        'spender' in message &&
        'nonce' in message &&
        'expiry' in message
      )
    )
      throw errors.EIP2612_DAI_PERMIT_MESSAGE_INVALID

    const types: Record<string, TypedDataField[]> = {
      Permit: [
        { name: 'holder', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'allowed', type: 'bool' }
      ]
    }
    // if allowed not provided, set to true
    if (!('allowed' in message)) message.allowed = true

    super(domain, types, message)
  }
}
