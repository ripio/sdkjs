import { Resource } from '@ripio/sdk-nft'

export default class ResourceAWS extends Resource {
  async parseData(): Promise<void> {
    this.parsedData = await this.data.Body?.transformToByteArray()
  }
}
