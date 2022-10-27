/* eslint-disable @typescript-eslint/no-explicit-any */
import Resource from './Resource'

export default interface StorageType {
  storage: any

  getData(data: any): Promise<Resource>
}
