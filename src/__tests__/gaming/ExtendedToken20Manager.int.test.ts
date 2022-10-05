/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BigNumber,
  Contract,
  ContractFactory,
  ethers,
  Signer,
  Wallet
} from 'ethers'
import { provider } from 'ganache'
import { JsonRPCWeb3Connector } from '../../connectors'
import { ExtendedToken20Manager } from '../../gaming'
import { UnitTypes } from '../../types/enums'
import errors from '../../types/errors'
import * as erc20Full from '../../__mocks__/ERC20Full.json'
import * as erc20Permit from '../../__mocks__/CustomERC20Permit.json'
import { EIP2612PermitTypedDataSigner } from '../../utils/typed-data'

const gprovider = provider({
  default_balance_ether: 1000,
  accounts: [
    {
      balance: 119400000000000000,
      secretKey:
        '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada'
    },
    {
      balance: 119400000000000000,
      secretKey:
        '0xb787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993adb'
    }
  ],
  logging: {
    logger: {
      // don't do anything
      log: () => {}
    }
  }
})

const w3 = new ethers.providers.Web3Provider(gprovider as any)

describe('ExtendedToken20Manager methods', () => {
  let contract: Contract
  let account: Signer
  let account2: Signer
  let sdk: ExtendedToken20Manager

  beforeEach(async () => {
    account = new Wallet(
      '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada',
      w3
    )
    account2 = new Wallet(
      '0xb787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993adb',
      w3
    )

    const contractFactory = ContractFactory.fromSolidity(erc20Full, account)
    contract = await contractFactory.deploy()

    const jProvider = new JsonRPCWeb3Connector(
      'x',
      '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada'
    )
    jProvider['_provider'] = w3
    jProvider['_account'] = w3.getSigner()
    await jProvider.activate()
    sdk = new ExtendedToken20Manager()
    await sdk.activate({
      contractAddress: contract.address,
      contractAbi: erc20Full.abi,
      connector: jProvider
    })
    sdk['_contract'] = new Contract(
      contract.address,
      erc20Full.abi,
      w3.getSigner()
    )
  }, 10000)

  it('Should mint a new token and return a tx hash', async () => {
    const balance = await contract.balanceOf(await account2.getAddress())
    const response = await sdk.mint(await account2.getAddress(), '1')
    const balance2 = await contract.balanceOf(await account2.getAddress())

    expect(balance.toString()).toBe('0')
    expect(response).not.toBe(undefined)
    expect(balance2.toString()).toBe('1000000000000000000')
  })

  it('Should mint a new token with the provided unit and return a tx hash', async () => {
    const balance = await contract.balanceOf(await account2.getAddress())
    const response = await sdk.mint(
      await account2.getAddress(),
      '1',
      UnitTypes.SZABO
    )
    const balance2 = await contract.balanceOf(await account2.getAddress())

    expect(balance.toString()).toBe('0')
    expect(response).not.toBe(undefined)
    expect(balance2.toString()).toBe('1000000000000')
  })

  it('Should throw an error when minting negative tokens', async () => {
    await expect(sdk.mint(await account2.getAddress(), '-1')).rejects.toThrow(
      errors.TRANSACTION_FAILED()
    )
  })

  it('Should burn a token and return a tx hash', async () => {
    const balance = await contract.balanceOf(await account.getAddress())
    const response = await sdk.mint(await account.getAddress(), '1')
    const balance2 = await contract.balanceOf(await account.getAddress())
    const response2 = await sdk.burn('1')
    const balance3 = await contract.balanceOf(await account.getAddress())

    expect(balance.toString()).toBe('0')
    expect(response).not.toBe(undefined)
    expect(balance2.toString()).toBe('1000000000000000000')
    expect(response2).not.toBe(undefined)
    expect(balance3.toString()).toBe('0')
  })

  it('Should burn a token with the provided unit and return a tx hash', async () => {
    const balance = await contract.balanceOf(await account.getAddress())
    const response = await sdk.mint(await account.getAddress(), '1')
    const balance2 = await contract.balanceOf(await account.getAddress())
    const response2 = await sdk.burn('1', UnitTypes.SZABO)
    const balance3 = await contract.balanceOf(await account.getAddress())

    expect(balance.toString()).toBe('0')
    expect(response).not.toBe(undefined)
    expect(balance2.toString()).toBe('1000000000000000000')
    expect(response2).not.toBe(undefined)
    expect(balance3.toString()).toBe('999999000000000000')
  })

  it('Should throw an error when burning negative tokens', async () => {
    await expect(sdk.burn('-1')).rejects.toThrow(errors.TRANSACTION_FAILED())
  })

  it('Should burn tokens from an account and return a tx hash', async () => {
    const balance = await contract.balanceOf(await account.getAddress())
    const response = await sdk.mint(await account.getAddress(), '1')
    await sdk.approve(await account.getAddress(), '1')
    const balance2 = await contract.balanceOf(await account.getAddress())
    const response2 = await sdk.burnFrom(await account.getAddress(), '1')
    const balance3 = await contract.balanceOf(await account.getAddress())

    expect(balance.toString()).toBe('0')
    expect(response).not.toBe(undefined)
    expect(balance2.toString()).toBe('1000000000000000000')
    expect(response2).not.toBe(undefined)
    expect(balance3.toString()).toBe('0')
  })

  it('Should burn tokens from an account with the provided unit and return a tx hash', async () => {
    const balance = await contract.balanceOf(await account.getAddress())
    const response = await sdk.mint(await account.getAddress(), '1')
    await sdk.approve(await account.getAddress(), '1')
    const balance2 = await contract.balanceOf(await account.getAddress())
    const response2 = await sdk.burnFrom(
      await account.getAddress(),
      '1',
      UnitTypes.SZABO
    )
    const balance3 = await contract.balanceOf(await account.getAddress())

    expect(balance.toString()).toBe('0')
    expect(response).not.toBe(undefined)
    expect(balance2.toString()).toBe('1000000000000000000')
    expect(response2).not.toBe(undefined)
    expect(balance3.toString()).toBe('999999000000000000')
  })

  it('Should throw an error when burning negative tokens from an account', async () => {
    await expect(
      sdk.burnFrom(await account.getAddress(), '-1')
    ).rejects.toThrow(errors.TRANSACTION_FAILED())
  })

  it('Should pause the contract and return a tx hash', async () => {
    const response = await sdk.pause()
    const paused = await contract.paused()

    expect(response).not.toBe(undefined)
    expect(paused).toBe(true)
  })

  it('Should throw an error when pausing a paused contract', async () => {
    await contract.pause()
    await expect(sdk.pause()).rejects.toThrow(errors.TRANSACTION_FAILED())
  })

  it('Should unpause the contract and return a tx hash', async () => {
    await contract.pause()
    const response = await sdk.unpause()
    const paused = await contract.paused()

    expect(response).not.toBe(undefined)
    expect(paused).toBe(false)
  })

  it('Should throw an error when unpausing an unpaused contract', async () => {
    await expect(sdk.unpause()).rejects.toThrow(errors.TRANSACTION_FAILED())
  })

  it('Should return the name of the contract', async () => {
    const name = await sdk.name()

    expect(name).toBe('ERC20Full')
  })

  it('Should return the symbol of the contract', async () => {
    const symbol = await sdk.symbol()

    expect(symbol).toBe('FULL20')
  })

  it('Should return the decimals of the contract', async () => {
    const decimals = await sdk.decimals()

    expect(decimals.toString()).toBe('18')
  })
})

describe('Permit related methods tests', () => {
  let contractPermit: Contract
  let account: Wallet
  let account2: Wallet
  let sdk: ExtendedToken20Manager
  jest
    .spyOn(ExtendedToken20Manager.prototype, 'validateStandard')
    .mockReturnValue()

  beforeEach(async () => {
    account = new Wallet(
      '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada',
      w3
    )
    account2 = new Wallet(
      '0xb787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993adb',
      w3
    )

    const contractFactoryPermit = ContractFactory.fromSolidity(
      erc20Permit,
      account
    )
    contractPermit = await contractFactoryPermit.deploy()

    const jProvider = new JsonRPCWeb3Connector(
      'x',
      '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada'
    )
    jProvider['_provider'] = w3
    jProvider['_account'] = account
    await jProvider.activate()

    sdk = new ExtendedToken20Manager()
    await sdk.activate({
      contractAddress: contractPermit.address,
      contractAbi: erc20Permit.abi,
      connector: jProvider
    })
    sdk['_contract'] = new Contract(
      contractPermit.address,
      erc20Permit.abi,
      w3.getSigner()
    )
  }, 10000)

  it('Should return the DOMAIN_SEPARATOR of the contract', async () => {
    const domainSeparator = await sdk.domainSeparator()

    expect(domainSeparator).toBe(
      '0x0fba5d10f583d13cbaa0ef21d572c1a199a1dcc9874e36b7ccabdbed89837633'
    )
  })

  it('Should return the nonce of the provided address', async () => {
    const nonce = await sdk.nonces(await account.getAddress())

    expect(nonce.toString()).toBe('0')
  })

  it('Should approve the spender using the permit method and the EIP2612PermitTypedDataSigner', async () => {
    const owner = await account.getAddress()
    const spender = await account2.getAddress()
    const connector = sdk['_connector']
    const domain = {
      name: await contractPermit.name(),
      version: '1',
      chainId: w3.network.chainId,
      verifyingContract: contractPermit.address
    }
    const value = BigNumber.from('99')
    const nonce = BigNumber.from('0')
    const deadline = BigNumber.from('9999999999999')
    const message = {
      owner,
      spender,
      value: value.toHexString(),
      nonce: nonce.toHexString(),
      deadline: deadline.toHexString()
    }

    // sign message with EIP2612PermitTypedDataSigner
    const typedDataSigner = new EIP2612PermitTypedDataSigner(domain, message)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const signature = await connector!.signTypedData(typedDataSigner)

    // execute permit method
    const response = await sdk.permit(
      owner,
      spender,
      value,
      deadline,
      signature.v,
      signature.r,
      signature.s
    )

    // check allowance
    const allowance = await contractPermit.allowance(
      await account.getAddress(),
      spender
    )

    expect(response).toBeDefined()
    expect(allowance.toString()).toBe('99')
  })
})
