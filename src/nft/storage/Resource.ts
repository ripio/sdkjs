/* eslint-disable @typescript-eslint/no-explicit-any */
export default interface Resource {
  data: any

  getStringData(): string
  getBytesData(): any
  getBase64Data(): string
  getJsonData(): object
}
