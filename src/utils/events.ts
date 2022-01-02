import { APIGatewayEvent, Email } from '../types'

/* Email */

const isValidEmail = (email: Email): Promise<Email> =>
  Promise.resolve()
    .then(() => email.from ?? Promise.reject('Missing from address value'))
    .then(() => (email.to?.length && email.to[0]) || Promise.reject('Missing to address array values'))
    .then(() => email.subject ?? Promise.reject('Missing subject value'))
    .then(() => email.text ?? Promise.reject('Missing text value'))
    .then(() => email)

const formatEmail = (email: Email): Promise<Email> =>
  isValidEmail(email).then(() => ({
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
  }))

/* Event */

const parseEventBody = (event: APIGatewayEvent): Promise<Email> =>
  Promise.resolve(
    JSON.parse(
      event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body as string)
    )
  )

export const extractEmailFromEvent = (event: APIGatewayEvent): Promise<Email> => parseEventBody(event).then(formatEmail)
