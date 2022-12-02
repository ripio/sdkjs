export interface NftMetadata {
  name?: string
  description?: string
  image?: string
  traits?: Array<object>
  attributes?: Array<object>
  properties?: Array<object>
  [key: string]: unknown // Custom extra data
}
