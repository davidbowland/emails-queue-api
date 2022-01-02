import { uuid } from '../__mocks__'
import { sqsQueueUrl } from '@config'
import { addToQueue } from '@services/sqs'

const mockSendMessage = jest.fn()
jest.mock('aws-sdk', () => ({
  SQS: jest.fn(() => ({
    sendMessage: (...args) => ({ promise: () => mockSendMessage(...args) }),
  })),
}))

describe('sqs', () => {
  describe('addToQueue', () => {
    beforeAll(() => {
      mockSendMessage.mockResolvedValue(undefined)
    })

    test('expect email to be added to queue', async () => {
      const body = { uuid }
      await addToQueue(body)
      expect(mockSendMessage).toHaveBeenCalledWith({
        MessageBody: JSON.stringify(body),
        MessageDeduplicationId: uuid,
        MessageGroupId: 'message-queue-id',
        QueueUrl: sqsQueueUrl,
      })
    })
  })
})
