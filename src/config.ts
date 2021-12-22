// S3

export const emailBucket = process.env.EMAIL_BUCKET as string

// SQS

export const sqsMessageGroupId = process.env.SQS_MESSAGE_QUEUE_ID as string
export const sqsQueueUrl = process.env.SQS_QUEUE_URL as string
