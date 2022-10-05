/* eslint-disable @typescript-eslint/no-explicit-any */
import { BigNumber, Contract, ContractFactory, providers, Wallet } from 'ethers'
import { provider } from 'ganache'
import { JsonRPCWeb3Connector } from '../../connectors'
import { ExtendedNFT721Manager } from '../../gaming'
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

describe('ExtendedNFT721Manager methods', () => {
  let contract: Contract
  let account: Wallet
  let account2: Wallet
  let sdk: ExtendedNFT721Manager

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
    sdk = new ExtendedNFT721Manager()
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
    await sdk.mint(await account.getAddress(), 'token0uri')
    // mint token 1 to account2
    await sdk.mint(await account2.getAddress(), 'token1uri')
  }, 10000)

  it('Should return true if the address is the owner of the token', async () => {
    const ownerOf = await sdk.isOwnerOf(await account2.getAddress(), '1')
    expect(ownerOf).toEqual(true)
  })

  it('Should return false if the address is not the owner of the token', async () => {
    const ownerOf = await sdk.isOwnerOf(await account.getAddress(), '1')
    expect(ownerOf).toEqual(false)
  })

  it('Should throw an error if the id does not exist calling isOwnerOf', async () => {
    await expect(
      sdk.isOwnerOf(await account.getAddress(), '2')
    ).rejects.toThrow(errors.ADDRESS_OWNERSHIP_ERROR())
  })

  it('Should burn a token', async () => {
    const balance_before = await sdk.balanceOf(await account.getAddress())
    const result = await sdk.burn('0')
    const balance_after = await sdk.balanceOf(await account.getAddress())

    expect(result).toBeDefined()
    expect(balance_before).toEqual(BigNumber.from(1))
    expect(balance_after).toEqual(BigNumber.from(0))
  })

  it('Should throw an error when burning a token without ownership', async () => {
    await expect(sdk.burn('1')).rejects.toThrow(errors.TRANSACTION_FAILED())
  })

  it('Should mint a token', async () => {
    const balance_before = await sdk.balanceOf(await account.getAddress())
    const result = await sdk.mint(await account.getAddress(), '')
    const balance_after = await sdk.balanceOf(await account.getAddress())

    expect(result).toBeDefined()
    // already 1 as the token was minted in the beforeEach
    expect(balance_before).toEqual(BigNumber.from(1))
    expect(balance_after).toEqual(BigNumber.from(2))
  })

  it('Should throw an error when minting a token to a non existent address', async () => {
    await expect(sdk.mint('0xfakeaddress', '')).rejects.toThrow(
      errors.TRANSACTION_FAILED()
    )
  })

  it('Should pause the contract', async () => {
    const paused = await sdk.pause()

    expect(paused).toBeDefined()
  })

  it('Should unpause a paused contract', async () => {
    await sdk.pause()
    const paused = await sdk.unpause()

    expect(paused).toBeDefined()
  })

  it('Should throw an error when pausing a paused contract', async () => {
    await sdk.pause()
    await expect(sdk.pause()).rejects.toThrow(errors.TRANSACTION_FAILED())
  })

  it('Should throw an error when unpausing an unpaused contract', async () => {
    await expect(sdk.unpause()).rejects.toThrow(errors.TRANSACTION_FAILED())
  })

  it('Should return the name of the contract', async () => {
    const name = await sdk.name()

    expect(name).toBeDefined()
    expect(name).toEqual('ERC721Full')
  })

  it('Should return the symbol of the contract', async () => {
    const symbol = await sdk.symbol()

    expect(symbol).toBeDefined()
    expect(symbol).toEqual('F721')
  })

  it('Should return the tokenURI of the token', async () => {
    const tokenUri = await sdk.tokenURI('0')

    expect(tokenUri).toBeDefined()
    expect(tokenUri).toEqual('token0uri')
  })

  it('Should throw an error when getting the tokenURI of a non existent token', async () => {
    await expect(sdk.tokenURI('2')).rejects.toThrow(errors.TRANSACTION_FAILED())
  })
})
