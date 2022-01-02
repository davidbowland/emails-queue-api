// S3

process.env.EMAIL_BUCKET = 'email-bucket'

// SQS

process.env.SQS_MESSAGE_QUEUE_ID = 'message-queue-id'
process.env.SQS_QUEUE_URL = 'https://dbowland.com/sqsQueue'

// Console

console.info = jest.fn()
console.log = jest.fn()
console.warn = jest.fn()
console.error = jest.fn()
