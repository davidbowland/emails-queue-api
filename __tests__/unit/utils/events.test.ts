import { bounceData, email } from '../__mocks__'
import bounceEventJson from '@events/post-bounce.json'
import emailEventJson from '@events/post-email.json'
import { APIGatewayEvent } from '@types'
import { extractBounceDataFromEvent, extractEmailFromEvent } from '@utils/events'

describe('event', () => {
  describe('extractEmailFromEvent', () => {
    const event = emailEventJson as unknown as APIGatewayEvent

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

  describe('extractBounceDataFromEvent', () => {
    const event = bounceEventJson as unknown as APIGatewayEvent

    it.each([
      { body: JSON.stringify({ ...bounceData, messageId: undefined }) },
      { body: JSON.stringify({ ...bounceData, recipients: [] }) },
      { body: JSON.stringify({ ...bounceData, recipients: undefined }) },
      { body: JSON.stringify({ ...bounceData, recipients: 'fnord' }) },
      { body: JSON.stringify({ ...bounceData, bounceSender: undefined }) },
      { body: JSON.stringify({ ...bounceData, bounceType: 'Jackhammer' }) },
      { body: JSON.stringify({ ...bounceData, action: 'exploded' }) },
    ])('should reject bad bounce data %s', (tempEvent: unknown) => {
      expect(() => extractBounceDataFromEvent(tempEvent as APIGatewayEvent)).toThrow()
    })

    it('should return formatted bounce data from event', () => {
      const result = extractBounceDataFromEvent(event)

      expect(result).toEqual(bounceData)
    })

    it('should return formatted bounce data from base64 encoded event', () => {
      const tempEvent = {
        ...event,
        body: Buffer.from(JSON.stringify(bounceData)).toString('base64'),
        isBase64Encoded: true,
      } as unknown as APIGatewayEvent
      const result = extractBounceDataFromEvent(tempEvent)

      expect(result).toEqual(bounceData)
    })

    it('should return formatted bounce data from reduced event', () => {
      const tempBounceData = {
        bounceSender: bounceData.bounceSender,
        messageId: bounceData.messageId,
        recipients: bounceData.recipients,
      }
      const tempEvent = { ...event, body: JSON.stringify(tempBounceData) } as unknown as APIGatewayEvent
      const result = extractBounceDataFromEvent(tempEvent)

      expect(result).toEqual({
        action: undefined,
        bounceSender: 'bounce@domain.com',
        bounceType: undefined,
        messageId: 'test-message-id-123',
        recipients: ['failed-recipient@domain.com'],
        status: undefined,
      })
    })
  })
})
