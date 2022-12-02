import { Resource } from '@ripio/sdk-nft'

export default class ResourceHttp extends Resource {
  async parseData(): Promise<void> {
    this.parsedData = Buffer.from(this.data, 'binary')
  }
}
