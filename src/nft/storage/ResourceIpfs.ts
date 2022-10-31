import all from 'it-all'
import { concat } from 'uint8arrays/concat'
import Resource from './Resource'

export default class ResourceIpfs extends Resource {
  async parseData(): Promise<void> {
    this.parsedData = concat(await all(this.data))
  }
}
