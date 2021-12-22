import { email, event, uuid } from '../__mocks__'
import { parseEventBody, postItem } from '../../../src/handlers/post-item'
import status from '../../../src/util/status'

const mockUuid = jest.fn().mockReturnValue(uuid)
jest.mock('uuid', () => ({
  v1: () => mockUuid(),
}))
const mockUploadContentsToS3 = jest.fn()
jest.mock('../../../src/services/s3', () => ({
  uploadContentsToS3: (uuid, body) => mockUploadContentsToS3(uuid, body),
}))
const mockAddToQueue = jest.fn()
const mockFormatEmail = jest.fn()
const mockIsValidEmail = jest.fn()
jest.mock('../../../src/services/sqs', () => ({
  addToQueue: (email) => mockAddToQueue(email),
  formatEmail: (email) => mockFormatEmail(email),
  isValidEmail: (email) => mockIsValidEmail(email),
}))
jest.mock('../../../src/util/error-handling', () => ({
  handleErrorWithDefault: (value) => () => value,
}))

describe('post-item', () => {
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
      mockAddToQueue.mockResolvedValue(undefined)
      mockFormatEmail.mockResolvedValue(email)
      mockIsValidEmail.mockReturnValue(true)
      mockUploadContentsToS3.mockResolvedValue(undefined)
    })

    test('expect NO_CONTENT when everything is valid', async () => {
      const result = await postItem(event)
      expect(result).toEqual(expect.objectContaining(status.NO_CONTENT))
    })

    test('expect uuid added to queue when everything is valid', async () => {
      await postItem(event)
      expect(mockAddToQueue).toHaveBeenCalledWith({ uuid })
    })

    test('expect NOT_FOUND when invalid method', async () => {
      const result = await postItem({ ...event, httpMethod: 'GET' })
      expect(result).toEqual(expect.objectContaining(status.NOT_FOUND))
    })

    test('expect BAD_REQUEST when invalid email', async () => {
      mockIsValidEmail.mockReturnValue(false)
      const result = await postItem({ ...event, body: JSON.stringify({ to: 'e@mail.address' }) })
      expect(result).toEqual(expect.objectContaining(status.BAD_REQUEST))
    })

    test('expect INTERNAL_SERVER_ERROR when invalid email JSON', async () => {
      const result = await postItem({ ...event, body: 'fnord' })
      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })
  })
})
