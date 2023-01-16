import { errors, ContractManager } from '@ripio/sdk'

const { MUST_ACTIVATE } = errors

export const ManagerMustBeActive =
  (managerKey?: string) =>
  (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = function (...args: any[]) {
      let manager
      if (
        args.length === 1 &&
        !(args[0] instanceof ContractManager) &&
        managerKey
      ) {
        // Args as object
        manager = args[0][managerKey]
      } else {
        // Args not as object
        for (const arg of args) {
          if (arg instanceof ContractManager) {
            manager = arg
            break
          }
        }
      }

      if (!manager.isActive) {
        throw MUST_ACTIVATE
      }
      return originalMethod.apply(this, args)
    }
    return descriptor
  }
