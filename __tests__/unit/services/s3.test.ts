import { messageBuffer, uuid } from '../__mocks__'
import { emailBucket } from '@config'
import { uploadContentsToS3 } from '@services/s3'

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
  const key = `queue/${uuid}`

  describe('uploadContentsToS3', () => {
    const tagging = 'Environment=test'

    test('expect key and data passed to S3 as object', async () => {
      await uploadContentsToS3(uuid, messageBuffer)

      expect(mockSend).toHaveBeenCalledWith({
        Body: messageBuffer,
        Bucket: emailBucket,
        Key: key,
        Metadata: {},
        Tagging: tagging,
      })
    })

    test('expect reject when promise rejects', async () => {
      const rejectReason = 'unable to foo the bar'
      mockSend.mockRejectedValueOnce(rejectReason)

      await expect(uploadContentsToS3(uuid, messageBuffer)).rejects.toEqual(rejectReason)
    })
  })
})
