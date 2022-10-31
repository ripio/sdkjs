import { S3Client } from "@aws-sdk/client-s3"

/* eslint-disable @typescript-eslint/no-explicit-any */
let mockSend = jest.fn(() => {})

const mockS3Client = jest.fn().mockImplementation((param: Record<string, string>) => {
  return {
    send: mockSend,
    config: {
      region: jest.fn(() => param['region'])
    }
  } as unknown as typeof S3Client
})


const GetObjectCommand = 
jest.fn().mockImplementation((data: Record<string, string>) => {
  return (
    {
      Bucket: data['bucket'],
      Key: data['key']
    }
  )
})

function __setMockSend(mock: any) {
  mockSend = mock
}

function __resetS3ClientMocks() {
  mockSend = jest.fn(() => {})
}

export {
  mockS3Client as S3Client,
  GetObjectCommand,
  __setMockSend,
  __resetS3ClientMocks,
}
