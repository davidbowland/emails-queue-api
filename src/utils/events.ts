import { APIGatewayEvent, Email } from '../types'

/* Email */

const formatEmail = (email: Email): Email => {
  if (!email.from) {
    throw new Error('Missing from address value')
  } else if (email.to && !Array.isArray(email.to)) {
    throw new Error('to must be an array of addresses, when present')
  } else if (email.cc && !Array.isArray(email.cc)) {
    throw new Error('cc must be an array of addresses, when present')
  } else if (email.bcc && !Array.isArray(email.bcc)) {
    throw new Error('bcc must be an array of addresses, when present')
  } else if ((email.to?.length ?? 0) + (email.cc?.length ?? 0) + (email.bcc?.length ?? 0) === 0) {
    throw new Error('One of to, cc, or bcc must be an array of addresses')
  } else if (!email.subject) {
    throw new Error('Missing subject value')
  }

  return {
    attachments: email.attachments,
    bcc: email.bcc,
    cc: email.cc,
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
    event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body as string),
  )

export const extractEmailFromEvent = (event: APIGatewayEvent): Email => formatEmail(parseEventBody(event))
