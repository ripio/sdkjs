import Resource from './Resource'

export default class ResourceAWS extends Resource {
  async parseData(): Promise<void> {
    this.parsedData = await this.data.Body?.transformToByteArray()
  }
}
