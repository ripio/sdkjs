import Resource from './Resource'

export default class ResourceAWS extends Resource {
  async parseData(): Promise<void> {
    if (this.parsedData != undefined) return
    this.parsedData = await this.data.Body?.transformToByteArray()
  }
}
