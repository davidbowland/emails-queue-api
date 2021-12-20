import { email } from '../__mocks__'
import { sqsQueueUrl } from '../../../src/config'
import { addToQueue, formatEmail, isValidEmail } from '../../../src/services/sqs'

const mockSendMessage = jest.fn()
jest.mock('aws-sdk', () => ({
  SQS: jest.fn(() => ({
    sendMessage: (params) => ({ promise: () => mockSendMessage(params) }),
  })),
}))

describe('sqs', () => {
  describe('formatEmail', () => {
    test.each([[email, email]])('expect formattedEmail=%s when given %s', async (expectedResult, value) => {
      const result = await formatEmail(value)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('isValidEmail', () => {
    test.each([
      [true, email],
      [false, { ...email, to: undefined }],
      [false, { ...email, from: undefined }],
      [false, { ...email, subject: undefined }],
      [false, { ...email, text: undefined }],
      [true, { ...email, html: undefined }],
    ])('expect isValid=%s when given %s', async (expectedResult, value) => {
      const result = await isValidEmail(value)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('addToQueue', () => {
    beforeAll(() => {
      mockSendMessage.mockResolvedValue(undefined)
    })

    test('expect email to be added to queue', async () => {
      await addToQueue(email)
      expect(mockSendMessage).toHaveBeenCalledWith({ MessageBody: JSON.stringify({ email }), QueueUrl: sqsQueueUrl })
    })
  })
})
