export * from 'aws-lambda'

export interface StringObject {
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
  headers?: StringObject
  attachments?: string[]
}
