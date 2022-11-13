export * from 'aws-lambda'

export interface StringObject {
  [key: string]: string
}

export interface AttachmentCommon {
  checksum: string
  cid?: string
  content: any
  contentDisposition: string
  contentId?: string
  contentType: string
  filename?: string
  headerLines: any
  headers: StringObject
  related?: boolean
  size: number
  type: 'attachment'
}

export interface Email {
  attachments?: AttachmentCommon[]
  from: string
  headers?: StringObject
  html: string
  inReplyTo?: string
  references?: string[]
  replyTo: string
  sender: string
  subject: string
  text: string
  to: string[]
}
