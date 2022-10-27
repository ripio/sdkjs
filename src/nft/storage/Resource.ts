/* eslint-disable @typescript-eslint/no-explicit-any */
export default interface Resource {
  data: any

  getStringData(): string
  getBytesData(): Uint8Array
  getBase64Data(): string
  getJsonData(): object
}
