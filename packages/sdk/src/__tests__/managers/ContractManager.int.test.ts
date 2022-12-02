/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Contract, ContractFactory, ethers, Signer, Wallet } from 'ethers'
import { provider } from 'ganache'
import { JsonRPCWeb3Connector } from '../../connectors'
import { ContractManager } from '../../managers'
import { UnitTypes } from '../../types/enums'
import { toWei } from '../../utils/conversions'
import * as erc20Full from '../../__mocks__/ERC20Full.json'

const sharedProviderConfig = {
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
  },
  miner: {
    blockTime: 2 // adding a delay of 2s so as to get time to cancel/speedUp transactions
  }
}

describe('ContractManager methods for eip-1559 chains', () => {
  let contract: Contract
  let account: Signer
  let account2: Signer
  let sdk: ContractManager

  beforeEach(async () => {
    // post london provider eip-1559
    const gprovider = provider({
      ...sharedProviderConfig
    })
    const w3 = new ethers.providers.Web3Provider(gprovider as any)
    account = new Wallet(
      '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada',
      w3
    )
    account2 = new Wallet(
      '0xb787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993adb',
      w3
    )
    // we could use any contract here, but we use ERC20Full for simplicity
    const contractFactory = ContractFactory.fromSolidity(erc20Full, account)
    contract = await contractFactory.deploy()

    const jProvider = new JsonRPCWeb3Connector(
      'x',
      '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada'
    )
    jProvider['_provider'] = w3
    jProvider['_account'] = w3.getSigner()
    await jProvider.activate()
    sdk = new ContractManager()
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

  it('should cancel a transaction if is not mined', async () => {
    // we need to increase the gas limit to allow the transaction to be mined
    // probably related to ganache chain gas prices
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sdk.connector!.speedUpPercentage = 22
    const amount = toWei('1', UnitTypes.ETHER).toString()
    const address = await account2.getAddress()
    const { transactionResponse: tx } = await sdk.execute({
      method: 'mint',
      params: [address, amount]
    })
    const cancel = await tx!.cancel()
    expect(await sdk.connector?.getTransaction(tx!.hash)).toBeNull()
    const txCan = await sdk.connector?.getTransaction(cancel.hash)
    expect(txCan).toBeDefined()
    expect(tx?.nonce).toEqual(1)
    expect(cancel?.nonce).toEqual(1)
    expect(txCan?.nonce).toEqual(1)
  })

  it('should speed up a transaction if is not yet mined', async () => {
    // we need to increase the gas limit to allow the transaction to be mined
    // probably related to ganache chain gas prices
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sdk.connector!.speedUpPercentage = 22
    const amount = toWei('1', UnitTypes.ETHER).toString()
    const address = await account2.getAddress()
    const { transactionResponse: tx } = await sdk.execute({
      method: 'mint',
      params: [address, amount]
    })
    const speedUp = await tx!.speedUp()
    expect(await sdk.connector?.getTransaction(tx!.hash)).toBeNull()
    const txSpeed = await sdk.connector?.getTransaction(speedUp.hash)
    expect(txSpeed).toBeDefined()
    expect(tx?.nonce).toEqual(1)
    expect(speedUp?.nonce).toEqual(1)
    expect(txSpeed?.nonce).toEqual(1)
  })

  it('should change a transaction if is not yet mined', async () => {
    // we need to increase the gas limit to allow the transaction to be mined
    // probably related to ganache chain gas prices
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sdk.connector!.speedUpPercentage = 22
    const amount = toWei('1', UnitTypes.ETHER).toString()
    const address = await account.getAddress()
    const address2 = await account2.getAddress()
    const { transactionResponse: tx } = await sdk.execute({
      method: 'mint',
      params: [address, amount]
    })
    const change = await tx!.change!({ to: address2 })
    expect(await sdk.connector?.getTransaction(tx!.hash)).toBeNull()
    const txChange = await sdk.connector?.getTransaction(change.hash)
    expect(txChange).toBeDefined()
    expect(tx?.nonce).toEqual(1)
    expect(change?.nonce).toEqual(1)
    expect(txChange?.nonce).toEqual(1)
  })
})

describe('ContractManager methods tested with non eip1559 chain', () => {
  let contract: Contract
  let account: Signer
  let account2: Signer
  let sdk: ContractManager

  beforeEach(async () => {
    // provider pre eip-1559
    const gproviderOld = provider({
      ...sharedProviderConfig,
      chain: {
        hardfork: 'berlin'
      }
    })
    const w3Old = new ethers.providers.Web3Provider(gproviderOld as any)
    account = new Wallet(
      '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada',
      w3Old
    )
    account2 = new Wallet(
      '0xb787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993adb',
      w3Old
    )
    // we could use any contract here, but we use ERC20Full for simplicity
    const contractFactory = ContractFactory.fromSolidity(erc20Full, account)
    contract = await contractFactory.deploy()

    const jProvider = new JsonRPCWeb3Connector(
      'x',
      '0xa787a8e580be61e711f689ee3ac64f6155e9d67ae6c2e1371edb49c9b4993ada'
    )
    jProvider['_provider'] = w3Old
    jProvider['_account'] = w3Old.getSigner()
    await jProvider.activate()
    sdk = new ContractManager()
    await sdk.activate({
      contractAddress: contract.address,
      contractAbi: erc20Full.abi,
      connector: jProvider
    })
    sdk['_contract'] = new Contract(
      contract.address,
      erc20Full.abi,
      w3Old.getSigner()
    )
  }, 10000)

  it('should cancel a transaction if is not mined', async () => {
    const amount = toWei('1', UnitTypes.ETHER).toString()
    const address = await account2.getAddress()
    const { transactionResponse: tx } = await sdk.execute({
      method: 'mint',
      params: [address, amount]
    })
    const cancel = await tx!.cancel()
    expect(await sdk.connector?.getTransaction(tx!.hash)).toBeNull()
    const txCan = await sdk.connector?.getTransaction(cancel.hash)
    expect(txCan).toBeDefined()
    expect(tx?.nonce).toEqual(1)
    expect(cancel?.nonce).toEqual(1)
    expect(txCan?.nonce).toEqual(1)
  })

  it('should speed up a transaction if is not yet mined', async () => {
    const amount = toWei('1', UnitTypes.ETHER).toString()
    const address = await account2.getAddress()
    const { transactionResponse: tx } = await sdk.execute({
      method: 'mint',
      params: [address, amount]
    })
    const speedUp = await tx!.speedUp()
    expect(await sdk.connector?.getTransaction(tx!.hash)).toBeNull()
    const txSpeed = await sdk.connector?.getTransaction(speedUp.hash)
    expect(txSpeed).toBeDefined()
    expect(tx?.nonce).toEqual(1)
    expect(speedUp?.nonce).toEqual(1)
    expect(txSpeed?.nonce).toEqual(1)
  })

  it('should change a transaction if is not yet mined', async () => {
    const amount = toWei('1', UnitTypes.ETHER).toString()
    const address = await account.getAddress()
    const address2 = await account2.getAddress()
    const { transactionResponse: tx } = await sdk.execute({
      method: 'mint',
      params: [address, amount]
    })
    const change = await tx!.change!({ to: address2 })
    expect(await sdk.connector?.getTransaction(tx!.hash)).toBeNull()
    const txChange = await sdk.connector?.getTransaction(change.hash)
    expect(txChange).toBeDefined()
    expect(tx?.nonce).toEqual(1)
    expect(change?.nonce).toEqual(1)
    expect(txChange?.nonce).toEqual(1)
  })
})
