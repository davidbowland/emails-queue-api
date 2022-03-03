import { APIGatewayEvent, Email } from '../types'

/* Email */

const formatEmail = (email: Email): Email => {
  if (!email.from) {
    throw new Error('Missing from address value')
  } else if (!email.to?.length || !email.to[0]) {
    throw new Error('Missing to address array values')
  } else if (!email.subject) {
    throw new Error('Missing subject value')
  } else if (!email.text) {
    throw new Error('Missing text value')
  }

  return {
    from: email.from,
    sender: email.sender ?? email.from,
    to: email.to,
    replyTo: email.replyTo ?? email.from,
    inReplyTo: email.inReplyTo,
    references: email.references,
    subject: email.subject,
    text: email.text,
    html: email.html ?? email.text,
    headers: email.headers,
    attachments: email.attachments,
  }
}

/* Event */

const parseEventBody = (event: APIGatewayEvent): Email =>
  JSON.parse(
    event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body as string)
  )

export const extractEmailFromEvent = (event: APIGatewayEvent): Email => formatEmail(parseEventBody(event))
