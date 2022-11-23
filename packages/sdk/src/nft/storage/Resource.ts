/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { toString } from 'uint8arrays/to-string'

/* eslint-disable @typescript-eslint/no-explicit-any */
export default abstract class Resource {
  readonly data: any
  parsedData: Uint8Array | undefined

  constructor(data: any) {
    this.data = data
  }

  /**
   * It parses the data/stream from the data attribute and transforms it into a byte array.
   */
  abstract parseData(): Promise<void>

  /**
   * It sets the parsedData property of the class to the result of the parseData() function.
   * If pasedData is already set, return.
   * @returns The parsedData is asigned to parsedData attribute.
   */
  async setParsedData(): Promise<void> {
    if (this.parsedData != undefined) return
    await this.parseData()
  }

  /**
   * The function getStringData() returns a string representation of the data property of the object
   * @returns The string representation of the data.
   */
  async getStringData(): Promise<string> {
    await this.setParsedData()
    return toString(this.parsedData!)
  }

  /**
   * It returns the data of the file as a Uint8Array.
   * @returns The parsed data property of the class
   */
  async getBytesData(): Promise<Uint8Array> {
    await this.setParsedData()
    return this.parsedData!
  }

  /**
   * It returns the base64 encoded string of the data property
   * @returns The base64 encoded data of the image.
   */
  async getBase64Data(): Promise<string> {
    await this.setParsedData()
    return toString(this.parsedData!, 'base64')
  }

  /**
   * It returns an object
   * @returns The JSON data is being returned.
   */
  async getJsonData(): Promise<{ [key: string]: any }> {
    const stringData = await this.getStringData()
    return JSON.parse(stringData)
  }
}
