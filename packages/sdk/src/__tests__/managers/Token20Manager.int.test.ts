/* eslint-disable @typescript-eslint/no-explicit-any */
import { Contract, ContractFactory, ethers, Signer, Wallet } from 'ethers'
import { provider } from 'ganache'
import { JsonRPCWeb3Connector } from '../../connectors'
import { Token20Manager } from '../../managers'
import { UnitTypes } from '../../types/enums'
import errors from '../../types/errors'
import { toWei } from '../../utils/conversions'
import * as erc20Full from '../../__mocks__/ERC20Full.json'

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

describe('Token20Manager methods', () => {
  let contract: Contract
  let account: Signer
  let account2: Signer
  let sdk: Token20Manager

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
    sdk = new Token20Manager()
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

  it('Should return the total supply', async () => {
    const supply = await sdk.totalSupply()
    await sdk.execute({
      method: 'mint',
      params: [await account.getAddress(), toWei('1', UnitTypes.ETHER)]
    })
    const supply2 = await sdk.totalSupply()

    expect(supply.toString()).toBe('0')
    expect(supply2.toString()).toBe('1000000000000000000')
  })

  it('Should return the balance of the provided address', async () => {
    const balance = await sdk.balanceOf(await account.getAddress())
    await sdk.execute({
      method: 'mint',
      params: [await account.getAddress(), toWei('1', UnitTypes.ETHER)]
    })
    const balance2 = await sdk.balanceOf(await account.getAddress())

    expect(balance.toString()).toBe('0')
    expect(balance2.toString()).toBe('1000000000000000000')
  })

  it('Should throw an error when getting the balance of an invalid address', async () => {
    expect(sdk.balanceOf('0x')).rejects.toThrow(errors.TRANSACTION_FAILED())
  })

  it('Should transfer tokens to the provided address and return a tx hash', async () => {
    const balance = await contract.balanceOf(await account.getAddress())
    const response = await sdk.execute({
      method: 'mint',
      params: [await account.getAddress(), toWei('1', UnitTypes.ETHER)]
    })
    const balance2 = await contract.balanceOf(await account.getAddress())
    const response2 = await sdk.transfer(await account2.getAddress(), '1')
    const balance3 = await contract.balanceOf(await account.getAddress())

    expect(balance.toString()).toBe('0')
    expect(response).not.toBe(undefined)
    expect(balance2.toString()).toBe('1000000000000000000')
    expect(response2).not.toBe(undefined)
    expect(balance3.toString()).toBe('0')
  })

  it('Should transfer tokens to the provided address with the provided unit and return a tx hash', async () => {
    const balance = await contract.balanceOf(await account.getAddress())
    const response = await sdk.execute({
      method: 'mint',
      params: [await account.getAddress(), toWei('1', UnitTypes.ETHER)]
    })
    const balance2 = await contract.balanceOf(await account.getAddress())
    const response2 = await sdk.transfer(
      await account2.getAddress(),
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

  it('Should throw an error when transferring tokens to an invalid address', async () => {
    await expect(sdk.transfer('0x', '1')).rejects.toThrow(
      errors.TRANSACTION_FAILED()
    )
  })

  it('Should return the allowance of the provided addresses', async () => {
    const allowance = await sdk.allowance(
      await account.getAddress(),
      await account2.getAddress()
    )

    expect(allowance.toString()).toBe('0')
  })

  it('Should throw an error when getting the allowance of an invalid address', async () => {
    await expect(sdk.allowance('0x', '0x')).rejects.toThrow(
      errors.TRANSACTION_FAILED()
    )
  })

  it('Should approve tokens for the provided address and return a tx hash', async () => {
    const response = await sdk.approve(await account2.getAddress(), '1')
    const allowance = await sdk.allowance(
      await account.getAddress(),
      await account2.getAddress()
    )

    expect(response).not.toBe(undefined)
    expect(allowance.toString()).toBe('1000000000000000000')
  })

  it('Should approve tokens for the provided address with the provided unit and return a tx hash', async () => {
    const response = await sdk.approve(
      await account2.getAddress(),
      '1',
      UnitTypes.SZABO
    )
    const allowance = await sdk.allowance(
      await account.getAddress(),
      await account2.getAddress()
    )

    expect(response).not.toBe(undefined)
    expect(allowance.toString()).toBe('1000000000000')
  })

  it('Should throw an error when approving an invalid address', async () => {
    await expect(sdk.approve('0x', '1')).rejects.toThrow(
      errors.TRANSACTION_FAILED()
    )
  })

  it('Should transfer tokens from the provided address to the provided address and return a tx hash', async () => {
    const balance = await contract.balanceOf(await account.getAddress())
    const response = await sdk.execute({
      method: 'mint',
      params: [await account.getAddress(), toWei('1', UnitTypes.ETHER)]
    })
    const balance2 = await contract.balanceOf(await account.getAddress())
    await sdk.approve(await account.getAddress(), '1')
    const response2 = await sdk.transferFrom(
      await account.getAddress(),
      await account2.getAddress(),
      '1'
    )
    const balance3 = await contract.balanceOf(await account.getAddress())

    expect(balance.toString()).toBe('0')
    expect(response).not.toBe(undefined)
    expect(balance2.toString()).toBe('1000000000000000000')
    expect(response2).not.toBe(undefined)
    expect(balance3.toString()).toBe('0')
  })

  it('Should transfer tokens from the provided address to the provided address with the provided unit and return a tx hash', async () => {
    const balance = await contract.balanceOf(await account.getAddress())
    const response = await sdk.execute({
      method: 'mint',
      params: [await account.getAddress(), toWei('1', UnitTypes.ETHER)]
    })
    const balance2 = await contract.balanceOf(await account.getAddress())
    await sdk.approve(await account.getAddress(), '1', UnitTypes.SZABO)
    const response2 = await sdk.transferFrom(
      await account.getAddress(),
      await account2.getAddress(),
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

  it('Should throw an error when transferring tokens from an invalid address', async () => {
    await expect(sdk.transferFrom('0x', '0x', '1')).rejects.toThrow(
      errors.TRANSACTION_FAILED()
    )
  })

  it('Should throw an error when transferring more tokens than the allowance', async () => {
    await expect(
      sdk.transferFrom(
        await account.getAddress(),
        await account2.getAddress(),
        '1'
      )
    ).rejects.toThrow(errors.TRANSACTION_FAILED())
  })
})
