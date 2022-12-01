/* eslint-disable @typescript-eslint/no-explicit-any */
import { BigNumber, Contract, ContractFactory, providers, Wallet } from 'ethers'
import { provider } from 'ganache'
import { JsonRPCWeb3Connector } from '../../connectors'
import { NFT721Manager } from '../../managers'
import errors from '../../types/errors'
import * as erc721Full from '../../__mocks__/ERC721Full.json'

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

describe('NFT721Manager methods', () => {
  let contract: Contract
  let account: Wallet
  let account2: Wallet
  let sdk: NFT721Manager

  beforeEach(async () => {
    account = new Wallet(
      '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada',
      w3
    )
    account2 = new Wallet(
      '0xb787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993adb',
      w3
    )

    const contractFactory = ContractFactory.fromSolidity(erc721Full, account)
    contract = await contractFactory.deploy()
    const jProvider = new JsonRPCWeb3Connector(
      'x',
      '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada'
    )
    jProvider['_provider'] = w3
    jProvider['_account'] = w3.getSigner()
    await jProvider.activate()
    sdk = new NFT721Manager()
    await sdk.activate({
      contractAddress: contract.address,
      contractAbi: erc721Full.abi,
      connector: jProvider
    })
    sdk['_connector'] = jProvider
    sdk['_contract'] = new Contract(
      contract.address,
      erc721Full.abi,
      w3.getSigner()
    )

    // mint token 0 to account
    await sdk.execute({
      method: 'safeMint',
      params: [await account.getAddress(), 'token0uri']
    })
    // mint token 1 to account2
    await sdk.execute({
      method: 'safeMint',
      params: [await account2.getAddress(), 'token1uri']
    })
  }, 10000)

  it('Shoud return the number of tokens of an account', async () => {
    const balance = await sdk.balanceOf(await account2.getAddress())
    expect(balance).toEqual(BigNumber.from(1))
  })

  it('Should throw an error when the address does not exist', async () => {
    await expect(sdk.balanceOf('0xfakeaddress')).rejects.toThrow(
      errors.TRANSACTION_FAILED()
    )
  })

  it('Should return the owner of the token', async () => {
    const owner = await sdk.ownerOf('1')
    expect(owner).toEqual(await account2.getAddress())
  })

  it('Should throw an error when the token id does not exist', async () => {
    await expect(sdk.ownerOf('2')).rejects.toThrow(errors.TRANSACTION_FAILED())
  })

  it('Should safeTransferFrom an account to another', async () => {
    const balance_before = await sdk.balanceOf(await account.getAddress())
    const balance2_before = await sdk.balanceOf(await account2.getAddress())
    const result = await sdk.safeTransferFrom(
      await account.getAddress(),
      await account2.getAddress(),
      '0'
    )
    const balance_after = await sdk.balanceOf(await account.getAddress())
    const balance2_after = await sdk.balanceOf(await account2.getAddress())

    expect(result).toBeDefined()
    expect(balance_before).toEqual(BigNumber.from(1))
    expect(balance2_before).toEqual(BigNumber.from(1))
    expect(balance_after).toEqual(BigNumber.from(0))
    expect(balance2_after).toEqual(BigNumber.from(2))
  })

  it('Should safeTransferFrom an account to another with data', async () => {
    const balance_before = await sdk.balanceOf(await account.getAddress())
    const balance2_before = await sdk.balanceOf(await account2.getAddress())
    const result = await sdk.safeTransferFrom(
      await account.getAddress(),
      await account2.getAddress(),
      '0',
      '0x12345678'
    )
    const balance_after = await sdk.balanceOf(await account.getAddress())
    const balance2_after = await sdk.balanceOf(await account2.getAddress())

    expect(result).toBeDefined()
    expect(balance_before).toEqual(BigNumber.from(1))
    expect(balance2_before).toEqual(BigNumber.from(1))
    expect(balance_after).toEqual(BigNumber.from(0))
    expect(balance2_after).toEqual(BigNumber.from(2))
  })

  it('Should throw an error when transfering a token without approval', async () => {
    await expect(
      sdk.safeTransferFrom(
        await account.getAddress(),
        await account2.getAddress(),
        '1'
      )
    ).rejects.toThrow(errors.TRANSACTION_FAILED())
  })

  it('Should transferFrom an account to another', async () => {
    const balance_before = await sdk.balanceOf(await account.getAddress())
    const balance2_before = await sdk.balanceOf(await account2.getAddress())
    const result = await sdk.transferFrom(
      await account.getAddress(),
      await account2.getAddress(),
      '0'
    )
    const balance_after = await sdk.balanceOf(await account.getAddress())
    const balance2_after = await sdk.balanceOf(await account2.getAddress())

    expect(result).toBeDefined()
    expect(balance_before).toEqual(BigNumber.from(1))
    expect(balance2_before).toEqual(BigNumber.from(1))
    expect(balance_after).toEqual(BigNumber.from(0))
    expect(balance2_after).toEqual(BigNumber.from(2))
  })

  it('Should throw an error when transfering a token without approval', async () => {
    await expect(
      sdk.transferFrom(
        await account.getAddress(),
        await account2.getAddress(),
        '1'
      )
    ).rejects.toThrow(errors.TRANSACTION_FAILED())
  })

  it('Should approve an account to spend a token', async () => {
    const result = await sdk.approve(await account2.getAddress(), '0')
    expect(result).toBeDefined()
  })

  it('Should fail when transfering without approval and succed with approval', async () => {
    const accountContract = sdk['_contract']
    // signing with account
    await expect(
      sdk.transferFrom(
        await account2.getAddress(),
        await account.getAddress(),
        '1'
      )
    ).rejects.toThrow(errors.TRANSACTION_FAILED())

    // signing with account 2
    sdk['_contract'] = new Contract(
      contract.address,
      erc721Full.abi,
      w3.getSigner(1)
    )
    const result = await sdk.approve(await account.getAddress(), '1')
    expect(result).toBeDefined()
    // signing with account
    sdk['_contract'] = accountContract

    const result2 = await sdk.transferFrom(
      await account2.getAddress(),
      await account.getAddress(),
      '1'
    )
    expect(result2).toBeDefined()
  })

  it('Should throw an error when approving a token to a non existent account', async () => {
    await expect(sdk.approve('0xfakeaddress', '0')).rejects.toThrow(
      errors.TRANSACTION_FAILED()
    )
  })

  it('Should throw an error when approving a non existent token', async () => {
    await expect(sdk.approve(await account2.getAddress(), '2')).rejects.toThrow(
      errors.TRANSACTION_FAILED()
    )
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

  it('Should approve an address to operate on behalf of a token', async () => {
    const approved = await sdk.getApproved('0')
    const result = await sdk.approve(await account2.getAddress(), '0')
    const approved2 = await sdk.getApproved('0')

    expect(result).toBeDefined()
    expect(approved).toEqual('0x0000000000000000000000000000000000000000')
    expect(approved2).toEqual(await account2.getAddress())
  })

  it('Should throw an error when getting the approved address for a non existent token', async () => {
    await expect(sdk.getApproved('2')).rejects.toThrow(
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
