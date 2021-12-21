import { SQS } from 'aws-sdk'

import { sqsQueueUrl } from '../config'

const sqs = new SQS({ apiVersion: '2012-11-05' })

export interface Headers {
  [key: string]: string
}

export interface Email {
  from: string
  sender: string
  to: string[]
  replyTo: string
  inReplyTo?: string
  references?: string[]
  subject: string
  text: string
  html: string
  headers?: Headers
  attachments?: string[]
}

/* Validation */

export const formatEmail = (email: Email): Email => ({
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
})

export const isValidEmail = (email: Email): boolean =>
  Boolean(email.from && email.to?.length && email.to[0] && email.subject && email.text)

/* Message queue */

export const addToQueue = (data: { [key: string]: string }) =>
  sqs
    .sendMessage({
      MessageBody: JSON.stringify(data),
      QueueUrl: sqsQueueUrl,
    })
    .promise()
