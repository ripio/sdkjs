/* eslint-disable @typescript-eslint/no-explicit-any */
import { BigNumber, Contract, ContractFactory, providers, Wallet } from 'ethers'
import { provider } from 'ganache'
import { JsonRPCWeb3Connector } from '../../connectors'
import { MultiToken1155Manager } from '../../managers'
import errors from '../../types/errors'
import * as erc1155Full from '../../__mocks__/ERC1155Full.json'

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

const w3 = new providers.Web3Provider(gprovider as any)

describe('MultiToken1155Manager methods', () => {
  let contract: Contract
  let account: Wallet
  let account2: Wallet
  let sdk: MultiToken1155Manager

  beforeEach(async () => {
    account = new Wallet(
      '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada',
      w3
    )
    account2 = new Wallet(
      '0xb787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993adb',
      w3
    )

    const contractFactory = ContractFactory.fromSolidity(erc1155Full, account)
    contract = await contractFactory.deploy()
    const jProvider = new JsonRPCWeb3Connector(
      'x',
      '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada'
    )
    jProvider['_provider'] = w3
    jProvider['_account'] = w3.getSigner()
    await jProvider.activate()
    sdk = new MultiToken1155Manager()
    await sdk.activate({
      contractAddress: contract.address,
      contractAbi: erc1155Full.abi,
      connector: jProvider
    })
    sdk['_connector'] = jProvider
    sdk['_contract'] = new Contract(
      contract.address,
      erc1155Full.abi,
      w3.getSigner()
    )

    // mint token 0 to account
    await sdk.execute({
      method: 'mint',
      params: [await account.getAddress(), '0', '1', 121234]
    })
    // mint token 1 to account2
    await sdk.execute({
      method: 'mint',
      params: [await account2.getAddress(), '1', '1', 121234]
    })
    // mint token 2 to account
    await sdk.execute({
      method: 'mint',
      params: [await account.getAddress(), '2', '10', 121234]
    })
  }, 10000)

  it('Shoud return the number of tokens of an account', async () => {
    const balance = await sdk.balanceOf(await account2.getAddress(), '1')
    expect(balance).toEqual(BigNumber.from(1))
  })

  it('Should throw an error when the address does not exist', async () => {
    await expect(sdk.balanceOf('0xfakeaddress', '0')).rejects.toThrow(
      errors.TRANSACTION_FAILED()
    )
  })

  it('Should return the a batched balance of an account', async () => {
    const balance = await sdk.balanceOfBatch(
      [await account2.getAddress(), await account2.getAddress()],
      [0x0, 0x1]
    )
    expect(balance).toEqual([BigNumber.from(0), BigNumber.from(1)])
  })

  it('Should safeTransferFrom an account to another', async () => {
    const balance_before = await sdk.balanceOf(await account.getAddress(), '0')
    const balance2_before = await sdk.balanceOf(
      await account2.getAddress(),
      '0'
    )
    const result = await sdk.safeTransferFrom(
      await account.getAddress(),
      await account2.getAddress(),
      '0',
      '1',
      121234
    )
    const balance_after = await sdk.balanceOf(await account.getAddress(), '0')
    const balance2_after = await sdk.balanceOf(await account2.getAddress(), '0')

    expect(result).toBeDefined()
    expect(balance_before).toEqual(BigNumber.from(1))
    expect(balance2_before).toEqual(BigNumber.from(0))
    expect(balance_after).toEqual(BigNumber.from(0))
    expect(balance2_after).toEqual(BigNumber.from(1))
  })

  it('Should safeBatchTransferFrom an account to another', async () => {
    const addresses = [
      await account.getAddress(),
      await account.getAddress(),
      await account2.getAddress(),
      await account2.getAddress()
    ]
    const ids = [0x0, 0x2, 0x0, 0x2]
    const [
      balance_before_token0,
      balance_before_token2,
      balance2_before_token0,
      balance2_before_token2
    ] = await sdk.balanceOfBatch(addresses, ids)
    const result = await sdk.safeBatchTransferFrom(
      await account.getAddress(),
      await account2.getAddress(),
      [0x0, 0x2],
      [0x1, 0x1],
      121234
    )
    const [
      balance_after_token0,
      balance_after_token2,
      balance2_after_token0,
      balance2_after_token2
    ] = await sdk.balanceOfBatch(addresses, ids)

    expect(result).toBeDefined()
    expect(balance_before_token0).toEqual(BigNumber.from(1))
    expect(balance2_before_token0).toEqual(BigNumber.from(0))
    expect(balance_after_token0).toEqual(BigNumber.from(0))
    expect(balance2_after_token0).toEqual(BigNumber.from(1))
    expect(balance_before_token2).toEqual(BigNumber.from(10))
    expect(balance2_before_token2).toEqual(BigNumber.from(0))
    expect(balance_after_token2).toEqual(BigNumber.from(9))
    expect(balance2_after_token2).toEqual(BigNumber.from(1))
  })

  it('Should throw an error when transfering a token without approval', async () => {
    await expect(
      sdk.safeTransferFrom(
        await account.getAddress(),
        await account2.getAddress(),
        '1',
        '1',
        121234
      )
    ).rejects.toThrow(errors.TRANSACTION_FAILED())
  })

  it('Should approve an operator to operate on behalf of any owned token', async () => {
    const approved = await sdk.isApprovedForAll(
      await account.getAddress(),
      await account2.getAddress()
    )
    const result = await sdk.setApprovalForAll(
      await account2.getAddress(),
      true
    )
    const approved2 = await sdk.isApprovedForAll(
      await account.getAddress(),
      await account2.getAddress()
    )

    expect(result).toBeDefined()
    expect(approved).toEqual(false)
    expect(approved2).toEqual(true)
  })

  it('Should throw an error when approving a non existent address as operator', async () => {
    await expect(sdk.setApprovalForAll('0xfakeaddress', true)).rejects.toThrow(
      errors.TRANSACTION_FAILED()
    )
  })

  it('Should throw an error when disapproving a non existent address as operator', async () => {
    await expect(sdk.setApprovalForAll('0xfakeaddress', false)).rejects.toThrow(
      errors.TRANSACTION_FAILED()
    )
  })

  it('Should get if an address is allowed to manage all of the assets of another address', async () => {
    const approved = await sdk.isApprovedForAll(
      await account.getAddress(),
      await account2.getAddress()
    )

    expect(approved).toEqual(false)
  })

  it('Should throw an error when getting if an address is allowed to manage all of the assets of a non existent address', async () => {
    await expect(
      sdk.isApprovedForAll('0xfakeaddress', await account2.getAddress())
    ).rejects.toThrow(errors.TRANSACTION_FAILED())
  })

  it('Should throw an error when getting if an address is allowed to manage all of the assets of a non existent address', async () => {
    await expect(
      sdk.isApprovedForAll(await account.getAddress(), '0xfakeaddress')
    ).rejects.toThrow(errors.TRANSACTION_FAILED())
  })
})
