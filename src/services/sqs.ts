import { SQS } from 'aws-sdk'

import { sqsMessageGroupId, sqsQueueUrl } from '../config'
import { StringObject } from '../types'

const sqs = new SQS({ apiVersion: '2012-11-05' })

/* Message queue */

export const addToQueue = (data: StringObject): Promise<SQS.SendMessageResult> =>
  sqs
    .sendMessage({
      MessageBody: JSON.stringify(data),
      MessageDeduplicationId: data.uuid,
      MessageGroupId: sqsMessageGroupId,
      QueueUrl: sqsQueueUrl,
    })
    .promise()
