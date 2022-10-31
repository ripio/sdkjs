import ResourceAws from '../../../nft/storage/ResourceAws'

describe('ResourceAws tests', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('Should set parsedData when calling parseData method', async () => {
        const actualData = new Uint8Array
        const data = {
            Body: {
                transformToByteArray: jest.fn().mockImplementation(async () => (actualData))
            }
        }
        const resource = new ResourceAws(data)
        await resource.parseData()
        expect(resource.parsedData).toEqual(actualData)
    })
})
