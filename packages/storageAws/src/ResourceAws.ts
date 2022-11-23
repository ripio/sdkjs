import { Resource } from '@ripio/nft'

export default class ResourceAWS extends Resource {
  async parseData(): Promise<void> {
    this.parsedData = await this.data.Body?.transformToByteArray()
  }
}
