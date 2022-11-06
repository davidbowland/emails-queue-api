import { APIGatewayEvent, Email } from '../types'

/* Email */

const formatEmail = (email: Email): Email => {
  if (!email.from) {
    throw new Error('Missing from address value')
  } else if (!email.to?.length || !email.to[0]) {
    throw new Error('Missing to address array values')
  } else if (!email.subject) {
    throw new Error('Missing subject value')
  } else if (!email.text && !email.html) {
    throw new Error('Either text or html must be supplied')
  }

  return {
    attachments: email.attachments,
    from: email.from,
    headers: email.headers,
    html: email.html ?? email.text,
    inReplyTo: email.inReplyTo,
    references: email.references,
    replyTo: email.replyTo ?? email.from,
    sender: email.sender ?? email.from,
    subject: email.subject,
    text: email.text,
    to: email.to,
  }
}

/* Event */

const parseEventBody = (event: APIGatewayEvent): Email =>
  JSON.parse(
    event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body as string)
  )

export const extractEmailFromEvent = (event: APIGatewayEvent): Email => formatEmail(parseEventBody(event))
