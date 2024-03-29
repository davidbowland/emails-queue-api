import * as s3Module from '@services/s3'
import { messageBuffer, uuid } from '../__mocks__'
import { putS3Object, uploadContentsToS3 } from '@services/s3'
import { emailBucket } from '@config'

const mockSend = jest.fn()
jest.mock('@aws-sdk/client-s3', () => ({
  PutObjectCommand: jest.fn().mockImplementation((x) => x),
  S3Client: jest.fn(() => ({
    send: (...args) => mockSend(...args),
  })),
}))
jest.mock('@utils/logging', () => ({
  xrayCapture: jest.fn().mockImplementation((x) => x),
}))

describe('S3', () => {
  const key = 'prefix/key'

  describe('uploadContentsToS3', () => {
    const mockPutS3Object = jest.spyOn(s3Module, 'putS3Object')

    beforeEach(() => {
      mockPutS3Object.mockResolvedValueOnce({})
    })

    test('expect uuid and body to be passed to putS3Object', async () => {
      await uploadContentsToS3(uuid, messageBuffer)

      expect(mockPutS3Object).toHaveBeenCalledWith(`queue/${uuid}`, messageBuffer)
    })
  })

  describe('putS3Object', () => {
    const metadata = {
      'Content-Type': 'text/plain',
    }
    const tagging = 'Environment=test'
    const valueToPut = 'Hello, world!'

    test('expect key and data passed to S3 as object', async () => {
      await putS3Object(key, valueToPut, metadata)

      expect(mockSend).toHaveBeenCalledWith({
        Body: valueToPut,
        Bucket: emailBucket,
        Key: key,
        Metadata: metadata,
        Tagging: tagging,
      })
    })

    test('expect no metadata passed to S3 when omitted', async () => {
      await putS3Object(key, valueToPut)

      expect(mockSend).toHaveBeenCalledWith({
        Body: valueToPut,
        Bucket: emailBucket,
        Key: key,
        Metadata: {},
        Tagging: tagging,
      })
    })

    test('expect reject when promise rejects', async () => {
      const rejectReason = 'unable to foo the bar'
      mockSend.mockRejectedValueOnce(rejectReason)

      await expect(putS3Object(key, valueToPut, metadata)).rejects.toEqual(rejectReason)
    })
  })
})
