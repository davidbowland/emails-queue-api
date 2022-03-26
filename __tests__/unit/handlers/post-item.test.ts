import * as uuid from 'uuid'
import { mocked } from 'jest-mock'

import * as events from '@utils/events'
import * as logging from '@utils/logging'
import * as s3 from '@services/s3'
import * as sqs from '@services/sqs'
import { email, uuid as expectedUuid } from '../__mocks__'
import { APIGatewayEvent } from '@types'
import eventJson from '@events/post-item.json'
import { postItem } from '@handlers/post-item'
import status from '@utils/status'

jest.mock('uuid')
jest.mock('@services/s3')
jest.mock('@services/sqs')
jest.mock('@utils/events')
jest.mock('@utils/logging')

describe('post-item', () => {
  const event = eventJson as unknown as APIGatewayEvent

  beforeAll(() => {
    mocked(events).extractEmailFromEvent.mockReturnValue(email)
    mocked(s3).uploadContentsToS3.mockResolvedValue(undefined)
    mocked(sqs).addToQueue.mockResolvedValue(undefined)
    mocked(uuid).v1.mockReturnValue(expectedUuid)
  })

  describe('postItem', () => {
    test('expect event object logged without body', async () => {
      await postItem(event)
      expect(mocked(logging).log).toHaveBeenCalledWith(expect.anything(), { ...event, body: undefined })
    })

    test('expect BAD_REQUEST when extractEmailFromEvent throws', async () => {
      mocked(events).extractEmailFromEvent.mockImplementationOnce(() => {
        throw new Error('Bad request')
      })
      const result = await postItem(event)
      expect(result).toEqual(status.BAD_REQUEST)
    })

    test('expect contents uploaded to S3', async () => {
      await postItem(event)
      expect(mocked(s3).uploadContentsToS3).toHaveBeenCalledWith(expectedUuid, JSON.stringify(email))
    })

    test('expect INTERNAL_SERVER_ERROR when upload error', async () => {
      mocked(s3).uploadContentsToS3.mockRejectedValueOnce(undefined)
      const result = await postItem(event)
      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    test('expect uuid added to queue', async () => {
      await postItem(event)
      expect(mocked(sqs).addToQueue).toHaveBeenCalledWith({ uuid: expectedUuid })
    })

    test('expect INTERNAL_SERVER_ERROR when queue error', async () => {
      mocked(sqs).addToQueue.mockRejectedValueOnce(undefined)
      const result = await postItem(event)
      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    test('expect NO_CONTENT when success', async () => {
      const result = await postItem(event)
      expect(result).toEqual(expect.objectContaining(status.NO_CONTENT))
    })
  })
})
