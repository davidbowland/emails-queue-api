import { email } from '../__mocks__'
import eventJson from '@events/post-item.json'
import { APIGatewayEvent } from '@types'
import { extractEmailFromEvent } from '@utils/events'

describe('event', () => {
  const event = eventJson as unknown as APIGatewayEvent

  describe('extractEmailFromEvent', () => {
    test.each([
      { body: JSON.stringify({ ...email, from: undefined }) },
      { body: JSON.stringify({ ...email, to: undefined }) },
      { body: JSON.stringify({ ...email, subject: undefined }) },
      { body: JSON.stringify({ ...email, text: undefined }) },
    ])('expect reject for bad email', async (tempEvent: unknown) => {
      await expect(extractEmailFromEvent(tempEvent as APIGatewayEvent)).rejects.toBeDefined()
    })

    test('expect formatted email from event', async () => {
      const result = await extractEmailFromEvent(event)
      expect(result).toEqual(email)
    })

    test('expect formatted email from event when base64', async () => {
      const tempEvent = {
        ...event,
        isBase64Encoded: true,
        body: Buffer.from(JSON.stringify(email)).toString('base64'),
      } as unknown as APIGatewayEvent
      const result = await extractEmailFromEvent(tempEvent)
      expect(result).toEqual(email)
    })

    test('expect formatted email from reduced event', async () => {
      const tempEmail = { ...email, sender: undefined, replyTo: undefined, html: undefined }
      const tempEvent = { ...event, body: JSON.stringify(tempEmail) } as unknown as APIGatewayEvent
      const result = await extractEmailFromEvent(tempEvent)
      expect(result).toEqual({
        attachments: undefined,
        from: 'do-not-reply@bowland.link',
        headers: {
          From: 'do-not-reply@bowland.link',
        },
        html: 'Hello, world',
        inReplyTo: undefined,
        references: [],
        replyTo: 'do-not-reply@bowland.link',
        sender: 'do-not-reply@bowland.link',
        subject: 'Hi there!',
        text: 'Hello, world',
        to: ['david@bowland.link'],
      })
    })
  })
})
