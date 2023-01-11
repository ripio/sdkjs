import { NFT_METADATA_FORMAT } from './types'
import { NFT721Manager } from '@ripio/sdk'
import { StorageType } from '../storage'
export interface NFTMetadata {
  name?: string
  description?: string
  image?: string
  traits?: Array<object>
  attributes?: Array<object>
  properties?: Array<object>
  [key: string]: unknown // Custom extra data
}

export interface NFTData {
  tokenId: string
  nftMetadata?: NFTMetadata
  image?: string
}

export interface NFTHandlerChangeParams {
  nftManager: NFT721Manager
  storage: StorageType
  nftFormat: NFT_METADATA_FORMAT
  tokenId: string
  nftMetadata?: NFTMetadata
  image?: string
}
