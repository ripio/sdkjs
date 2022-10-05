import { TransactionResponse } from '@ethersproject/providers'
import { BigNumber, BigNumberish } from 'ethers'
import { BytesLike, Hexable, ParamType } from 'ethers/lib/utils'

export {
  TransactionResponse,
  TransactionRequest
} from '@ethersproject/providers'

export interface ConnectInfo {
  chainId: string
}

/* Metamask error codes
  4001  - The request was rejected by the user
-32602  - The parameters were invalid
-32603  - Internal error
 */
export interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}

export interface OverrideExecuteOptions {
  /* the amount of gas to allow a node to use during the execution of the code */
  gasLimit?: BigNumberish
  /* the price to pay per gas */
  gasPrice?: BigNumberish
}

/* Defining the interface for the options object that is passed to the execute function. */
export interface ExecuteFunctionOptions {
  /* Name of the function to be called. It can be overloaded. */
  method: string
  /* Amount to be provided on the contract call when the function is payable. */
  value?: string
  /* Array containing the parameters to be sent. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Array<any>
  /* Overrides configuration arguments provided to the contract call  */
  overrides?: OverrideExecuteOptions
}

/* Defining a generic object that can have any key and any value. */
export interface GenericObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: string | number | boolean | Array<any> | object | GenericObject
}
export interface TransactionResponseExtended extends TransactionResponse {
  cancel: (gasSpeed?: BigNumber) => Promise<TransactionResponse>
  speedUp: (gasSpeed?: BigNumber) => Promise<TransactionResponse>
  change?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newParams: Record<string, any>,
    gasSpeed?: BigNumber
  ) => Promise<TransactionResponse>
}

export interface ExecuteResponse {
  transactionResponse?: TransactionResponseExtended
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any
  isTransaction: boolean
}

export interface abiEventInterface {
  name: string
  anonymous: boolean
  inputs: Array<ParamType>
  type: string
  _isFragment: boolean
}

export interface ContractEvents {
  name: string
  inputs: Array<ParamType>
}

export interface ValueInput {
  name: string
  value: string | number | boolean
}

export interface AddEthereumChainParameter {
  chainId: string // A 0x-prefixed hexadecimal string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string // 2-6 characters long
    decimals: 18
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[] // Currently ignored.
}

export type Bytes = BytesLike | Hexable | number

export interface EIP2612PermitMessage {
  owner: string
  spender: string
  value: BigNumberish
  nonce: BigNumberish
  deadline: BigNumberish
}

export interface DaiPermitMessage {
  holder: string
  spender: string
  nonce: BigNumberish
  expiry: BigNumberish
  allowed?: boolean
}
