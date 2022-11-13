import { APIGatewayEvent } from '@types'
import { email } from '../__mocks__'
import eventJson from '@events/post-item.json'
import { extractEmailFromEvent } from '@utils/events'

describe('event', () => {
  const event = eventJson as unknown as APIGatewayEvent

  describe('extractEmailFromEvent', () => {
    test.each([
      { body: JSON.stringify({ ...email, from: undefined }) },
      { body: JSON.stringify({ ...email, to: undefined }) },
      { body: JSON.stringify({ ...email, subject: undefined }) },
      { body: JSON.stringify({ ...email, html: undefined, text: undefined }) },
    ])('expect reject for bad email', (tempEvent: unknown) => {
      expect(() => extractEmailFromEvent(tempEvent as APIGatewayEvent)).toThrow()
    })

    test('expect formatted email from event', () => {
      const result = extractEmailFromEvent(event)
      expect(result).toEqual(email)
    })

    test('expect formatted email from event when base64', () => {
      const tempEvent = {
        ...event,
        body: Buffer.from(JSON.stringify(email)).toString('base64'),
        isBase64Encoded: true,
      } as unknown as APIGatewayEvent
      const result = extractEmailFromEvent(tempEvent)
      expect(result).toEqual(email)
    })

    test('expect formatted email from reduced event', () => {
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
