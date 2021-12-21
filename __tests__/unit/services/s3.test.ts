import { S3 } from 'aws-sdk'

import { emailBucket } from '../../../src/config'
import { putS3Object } from '../../../src/services/s3'

const mockPutObject = jest.fn()
jest.mock('aws-sdk', () => ({
  S3: jest.fn(() => ({
    putObject: (params: S3.Types.PutObjectRequest) => ({ promise: () => mockPutObject(params) }),
  })),
}))

jest.mock('../../../src/util/error-handling', () => ({
  handleErrorWithDefault: (value) => () => value,
}))

describe('S3', () => {
  const key = 'prefix/key'

  describe('putS3Object', () => {
    const metadata = {
      'Content-Type': 'text/plain',
    }
    const valueToPut = 'Hello, world!'

    test('expect key and data passed to S3 as object', async () => {
      await putS3Object(key, valueToPut, metadata)
      expect(mockPutObject).toHaveBeenCalledWith({
        Body: valueToPut,
        Bucket: emailBucket,
        Key: key,
        Metadata: metadata,
      })
    })

    test('expect no metadata passed to S3 when omitted', async () => {
      await putS3Object(key, valueToPut)
      expect(mockPutObject).toHaveBeenCalledWith({ Body: valueToPut, Bucket: emailBucket, Key: key, Metadata: {} })
    })

    test('expect reject when promise rejects', async () => {
      const rejectReason = 'unable to foo the bar'
      mockPutObject.mockRejectedValueOnce(rejectReason)
      await expect(putS3Object(key, valueToPut, metadata)).rejects.toEqual(rejectReason)
    })
  })
})
