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
  bcc?: string[]
  cc?: string[]
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

export interface BounceData {
  recipients: string[]
  bounceSender: string
  bounceType?: BounceType
  action?: DsnAction
  status?: string
}

export type BounceType =
  | 'ContentRejected'
  | 'DoesNotExist'
  | 'ExceededQuota'
  | 'MessageTooLarge'
  | 'TemporaryFailure'
  | 'Undefined'
export type DsnAction = 'delayed' | 'delivered' | 'expanded' | 'failed' | 'relayed'
