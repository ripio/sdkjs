// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ManagerMustBeActive } from './../../utils'
import { errors, NFT721Manager, ContractManager } from '@ripio/sdk'

class Test {
  @ManagerMustBeActive('nftManager')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static method({ nftManager }: { nftManager: NFT721Manager }) {
    return 'Worked'
  }

  @ManagerMustBeActive()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static anotherMethod(fakeParam: string, nftManager: NFT721Manager) {
    return 'Worked'
  }
}

describe('ManagerMustBeActive decorator', () => {
  it('Should throw error if the Manager is not activate (params as object)', async () => {
    const nftManager = {
      isActive: false
    } as unknown as NFT721Manager
    Object.setPrototypeOf(nftManager, ContractManager.prototype)

    expect(() => {
      Test.method({ nftManager })
    }).toThrowError(errors.MUST_ACTIVATE)
  })

  it('Should throw error if the Manager is not activate (params not as object)', async () => {
    const nftManager = {
      isActive: false
    } as unknown as NFT721Manager
    Object.setPrototypeOf(nftManager, ContractManager.prototype)

    expect(() => {
      Test.anotherMethod('fake-data', nftManager)
    }).toThrowError(errors.MUST_ACTIVATE)
  })

  it('Should call the original method if the Manager is active', async () => {
    const nftManager = {
      isActive: true
    } as unknown as NFT721Manager
    Object.setPrototypeOf(nftManager, ContractManager.prototype)

    const res = Test.method({ nftManager })
    expect(res).toBe('Worked')
  })
})
