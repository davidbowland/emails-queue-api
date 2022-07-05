import { uuid } from '../__mocks__'

import { addToQueue } from '@services/sqs'
import { sqsQueueUrl } from '@config'

const mockSendMessage = jest.fn()
jest.mock('aws-sdk', () => ({
  SQS: jest.fn(() => ({
    sendMessage: (...args) => ({ promise: () => mockSendMessage(...args) }),
  })),
}))
jest.mock('@utils/logging', () => ({
  xrayCapture: jest.fn().mockImplementation((x) => x),
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
