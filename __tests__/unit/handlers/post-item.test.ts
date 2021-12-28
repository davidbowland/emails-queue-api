import { mocked } from 'jest-mock'
import * as uuid from 'uuid'

import { email, event, uuid as expectedUuid } from '../__mocks__'
import { parseEventBody, postItem } from '@handlers/post-item'
import * as s3 from '@services/s3'
import * as sqs from '@services/sqs'
import status from '@util/status'

jest.mock('uuid')
jest.mock('@services/s3')
jest.mock('@services/sqs')
jest.mock('@util/error-handling', () => ({
  handleErrorWithDefault: (value) => () => value,
  log: () => () => undefined,
}))

describe('post-item', () => {
  beforeAll(() => {
    mocked(uuid).v1.mockReturnValue(expectedUuid)
  })

  describe('parseEventBody', () => {
    test.each([true, false])(
      'expect bodies to be base64 decoded, when necessary (isBase64Encoded=%s)',
      async (isBase64Encoded: boolean) => {
        const expectedResult = { motto: 'veni vidi vici' }
        const tempEvent = {
          ...event,
          isBase64Encoded,
          body: isBase64Encoded
            ? Buffer.from(JSON.stringify(expectedResult)).toString('base64')
            : JSON.stringify(expectedResult),
        }

        const result = await parseEventBody(tempEvent)
        expect(result).toEqual(expectedResult)
      }
    )
  })

  describe('postItem', () => {
    beforeAll(() => {
      mocked(sqs).addToQueue.mockResolvedValue(undefined)
      mocked(sqs).formatEmail.mockResolvedValue(email)
      mocked(sqs).isValidEmail.mockReturnValue(true)
      mocked(s3).uploadContentsToS3.mockResolvedValue(undefined)
    })

    test('expect NO_CONTENT when everything is valid', async () => {
      const result = await postItem(event)
      expect(result).toEqual(expect.objectContaining(status.NO_CONTENT))
    })

    test('expect uuid added to queue when everything is valid', async () => {
      await postItem(event)
      expect(mocked(sqs).addToQueue).toHaveBeenCalledWith({ uuid: expectedUuid })
    })

    test('expect NOT_FOUND when invalid method', async () => {
      const result = await postItem({ ...event, httpMethod: 'GET' })
      expect(result).toEqual(expect.objectContaining(status.NOT_FOUND))
    })

    test('expect BAD_REQUEST when invalid email', async () => {
      mocked(sqs).isValidEmail.mockReturnValue(false)
      const result = await postItem({ ...event, body: JSON.stringify({ to: 'e@mail.address' }) })
      expect(result).toEqual(expect.objectContaining(status.BAD_REQUEST))
    })

    test('expect INTERNAL_SERVER_ERROR when invalid email JSON', async () => {
      const result = await postItem({ ...event, body: 'fnord' })
      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })
  })
})
