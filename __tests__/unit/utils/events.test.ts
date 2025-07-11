import { email } from '../__mocks__'
import eventJson from '@events/post-item.json'
import { APIGatewayEvent } from '@types'
import { extractEmailFromEvent } from '@utils/events'

describe('event', () => {
  const event = eventJson as unknown as APIGatewayEvent

  describe('extractEmailFromEvent', () => {
    it.each([
      { body: JSON.stringify({ ...email, bcc: [], cc: [], to: [] }) },
      { body: JSON.stringify({ ...email, bcc: undefined, cc: undefined, to: undefined }) },
      { body: JSON.stringify({ ...email, bcc: 'fnord' }) },
      { body: JSON.stringify({ ...email, cc: 'fnord' }) },
      { body: JSON.stringify({ ...email, from: undefined }) },
      { body: JSON.stringify({ ...email, to: 'fnord' }) },
      { body: JSON.stringify({ ...email, subject: undefined }) },
    ])('should reject bad email %s', (tempEvent: unknown) => {
      expect(() => extractEmailFromEvent(tempEvent as APIGatewayEvent)).toThrow()
    })

    it('should return formatted email from event', () => {
      const result = extractEmailFromEvent(event)

      expect(result).toEqual(email)
    })

    it('should return formatted email from base64 encoded event', () => {
      const tempEvent = {
        ...event,
        body: Buffer.from(JSON.stringify(email)).toString('base64'),
        isBase64Encoded: true,
      } as unknown as APIGatewayEvent
      const result = extractEmailFromEvent(tempEvent)

      expect(result).toEqual(email)
    })

    it('should return formatted email from reduced event', () => {
      const tempEmail = { ...email, html: undefined, replyTo: undefined, sender: undefined }
      const tempEvent = { ...event, body: JSON.stringify(tempEmail) } as unknown as APIGatewayEvent
      const result = extractEmailFromEvent(tempEvent)

      expect(result).toEqual({
        attachments: undefined,
        bcc: ['bcc@domain.com'],
        cc: ['cc@domain.com'],
        from: 'do-not-reply@domain.com',
        headers: {
          From: 'do-not-reply@domain.com',
        },
        html: 'Hello, world',
        inReplyTo: undefined,
        references: [],
        replyTo: 'do-not-reply@domain.com',
        sender: 'do-not-reply@domain.com',
        subject: 'Hi there!',
        text: 'Hello, world',
        to: ['david@domain.com'],
      })
    })
  })
})
