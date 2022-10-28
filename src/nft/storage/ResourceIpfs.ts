import { isRequired } from '../../utils/validations'
import { concat } from 'uint8arrays/concat'
import { toString } from 'uint8arrays/to-string'
import Resource from './Resource'

export default class ResourceIpfs implements Resource {
  data: Uint8Array[]
  /**
   * The constructor function takes an array of Uint8Arrays as an argument and assigns it to the data
   * property of the class.
   * @param {Uint8Array[]} data - Uint8Array[]
   */
  constructor(data: Uint8Array[] = isRequired('data')) {
    this.data = data
  }
  /**
   * It returns a string representation of the data in the object.
   * @returns The string representation of the bytes data.
   */
  getStringData(): string {
    return toString(this.getBytesData())
  }
  /**
   * It takes an array of arrays of bytes and returns a single array of bytes
   * @returns The concatenated data of the block.
   */
  getBytesData(): Uint8Array {
    return concat(this.data)
  }
  /**
   * It returns the base64 encoded string of the bytes data of the current instance
   * @returns The base64 encoded string of the bytes data.
   */
  getBase64Data(): string {
    return toString(this.getBytesData(), 'base64')
  }
  /**
   * It returns an object that is the result of parsing a string that is the result of calling a
   * function that returns a string
   * @returns The JSON data is being returned.
   */
  getJsonData(): object {
    const str = this.getStringData()
    return JSON.parse(str)
  }
}
