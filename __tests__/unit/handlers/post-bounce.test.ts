import { mocked } from 'jest-mock'

import { bounceData } from '../__mocks__'
import eventJson from '@events/post-bounce.json'
import { postBounceHandler } from '@handlers/post-bounce'
import * as s3 from '@services/s3'
import * as sqs from '@services/sqs'
import { APIGatewayEvent } from '@types'
import * as events from '@utils/events'
import * as logging from '@utils/logging'
import status from '@utils/status'

jest.mock('@services/s3')
jest.mock('@services/sqs')
jest.mock('@utils/events')
jest.mock('@utils/logging')

describe('post-bounce', () => {
  const event = eventJson as unknown as APIGatewayEvent
  const expectedMessageId = 'test-message-id-123'

  beforeAll(() => {
    mocked(events).extractBounceDataFromEvent.mockReturnValue(bounceData)
    mocked(s3).uploadContentsToS3.mockResolvedValue(undefined)
    mocked(sqs).addToQueue.mockResolvedValue(undefined)
  })

  describe('postBounceHandler', () => {
    it('should log event object without body', async () => {
      await postBounceHandler(event)

      expect(mocked(logging).log).toHaveBeenCalledWith(expect.anything(), { ...event, body: undefined })
    })

    it('should return BAD_REQUEST when extractBounceDataFromEvent throws', async () => {
      mocked(events).extractBounceDataFromEvent.mockImplementationOnce(() => {
        throw new Error('Bad request')
      })
      const result = await postBounceHandler(event)

      expect(result).toEqual(status.BAD_REQUEST)
    })

    it('should upload contents to S3 with queue-bounced prefix', async () => {
      await postBounceHandler(event)

      expect(mocked(s3).uploadContentsToS3).toHaveBeenCalledWith(
        expectedMessageId,
        JSON.stringify(bounceData),
        'queue-bounced',
      )
    })

    it('should return INTERNAL_SERVER_ERROR when upload fails', async () => {
      mocked(s3).uploadContentsToS3.mockRejectedValueOnce(undefined)
      const result = await postBounceHandler(event)

      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    it('should add uuid to queue', async () => {
      await postBounceHandler(event)

      expect(mocked(sqs).addToQueue).toHaveBeenCalledWith({ uuid: expectedMessageId })
    })

    it('should return INTERNAL_SERVER_ERROR when queue operation fails', async () => {
      mocked(sqs).addToQueue.mockRejectedValueOnce(undefined)
      const result = await postBounceHandler(event)

      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    it('should return CREATED status and messageId on success', async () => {
      const result = await postBounceHandler(event)

      expect(result).toEqual(expect.objectContaining(status.CREATED))
      expect(JSON.parse(result.body).messageId).toBe(expectedMessageId)
    })
  })
})
