import { v1 as uuidv1 } from 'uuid'

import { uploadContentsToS3 } from '../services/s3'
import { addToQueue } from '../services/sqs'
import { APIGatewayEvent, APIGatewayProxyResult, BounceData } from '../types'
import { extractBounceDataFromEvent } from '../utils/events'
import { log, logError } from '../utils/logging'
import status from '../utils/status'

const processBounce = async (bounceData: BounceData): Promise<APIGatewayProxyResult> => {
  try {
    const uuid = uuidv1()
    await uploadContentsToS3(uuid, JSON.stringify(bounceData), 'queue-bounced')
    await addToQueue({ uuid })
    return { ...status.CREATED, body: JSON.stringify({ messageId: uuid }) }
  } catch (error) {
    logError(error)
    return status.INTERNAL_SERVER_ERROR
  }
}

export const postBounceHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  log('Received event', { ...event, body: undefined })
  try {
    const bounceData = extractBounceDataFromEvent(event)
    return await processBounce(bounceData)
  } catch (error: unknown) {
    return { ...status.BAD_REQUEST, body: JSON.stringify({ message: (error as Error).message }) }
  }
}
