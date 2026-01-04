import { mocked } from 'jest-mock'
import * as uuid from 'uuid'

import { email, uuid as expectedUuid } from '../__mocks__'
import eventJson from '@events/post-email.json'
import { postEmailHandler } from '@handlers/post-email'
import * as s3 from '@services/s3'
import * as sqs from '@services/sqs'
import { APIGatewayEvent } from '@types'
import * as events from '@utils/events'
import * as logging from '@utils/logging'
import status from '@utils/status'

jest.mock('uuid')
jest.mock('@services/s3')
jest.mock('@services/sqs')
jest.mock('@utils/events')
jest.mock('@utils/logging')

describe('post-email', () => {
  const event = eventJson as unknown as APIGatewayEvent

  beforeAll(() => {
    mocked(events).extractEmailFromEvent.mockReturnValue(email)
    mocked(s3).uploadContentsToS3.mockResolvedValue(undefined)
    mocked(sqs).addToQueue.mockResolvedValue(undefined)
    mocked(uuid).v1.mockReturnValue(expectedUuid)
  })

  describe('postEmailHandler', () => {
    it('should log event object without body', async () => {
      await postEmailHandler(event)

      expect(mocked(logging).log).toHaveBeenCalledWith(expect.anything(), { ...event, body: undefined })
    })

    it('should return BAD_REQUEST when extractEmailFromEvent throws', async () => {
      mocked(events).extractEmailFromEvent.mockImplementationOnce(() => {
        throw new Error('Bad request')
      })
      const result = await postEmailHandler(event)

      expect(result).toEqual(status.BAD_REQUEST)
    })

    it('should upload contents to S3', async () => {
      await postEmailHandler(event)

      expect(mocked(s3).uploadContentsToS3).toHaveBeenCalledWith(expectedUuid, JSON.stringify(email))
    })

    it('should return INTERNAL_SERVER_ERROR when upload fails', async () => {
      mocked(s3).uploadContentsToS3.mockRejectedValueOnce(undefined)
      const result = await postEmailHandler(event)

      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    it('should add uuid to queue', async () => {
      await postEmailHandler(event)

      expect(mocked(sqs).addToQueue).toHaveBeenCalledWith({ uuid: expectedUuid })
    })

    it('should return INTERNAL_SERVER_ERROR when queue operation fails', async () => {
      mocked(sqs).addToQueue.mockRejectedValueOnce(undefined)
      const result = await postEmailHandler(event)

      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    it('should return CREATED status and UUID on success', async () => {
      const result = await postEmailHandler(event)

      expect(result).toEqual(expect.objectContaining(status.CREATED))
      expect(JSON.parse(result.body).messageId).toBeDefined()
    })
  })
})
