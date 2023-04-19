import { uuid } from '../__mocks__'

import { addToQueue } from '@services/sqs'
import { sqsQueueUrl } from '@config'

const mockSend = jest.fn()
jest.mock('@aws-sdk/client-sqs', () => ({
  SendMessageCommand: jest.fn().mockImplementation((x) => x),
  SQSClient: jest.fn(() => ({
    send: (...args) => mockSend(...args),
  })),
}))
jest.mock('@utils/logging', () => ({
  xrayCapture: jest.fn().mockImplementation((x) => x),
}))

describe('sqs', () => {
  describe('addToQueue', () => {
    beforeAll(() => {
      mockSend.mockResolvedValue(undefined)
    })

    test('expect email to be added to queue', async () => {
      const body = { uuid }
      await addToQueue(body)

      expect(mockSend).toHaveBeenCalledWith({
        MessageBody: JSON.stringify(body),
        MessageDeduplicationId: uuid,
        MessageGroupId: 'message-queue-id',
        QueueUrl: sqsQueueUrl,
      })
    })
  })
})
