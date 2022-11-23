import { Resource } from '@ripio/nft'

export default class ResourceHttp extends Resource {
  async parseData(): Promise<void> {
    this.parsedData = Buffer.from(this.data, 'binary')
  }
}
