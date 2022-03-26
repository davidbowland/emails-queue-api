import { v1 as uuidv1 } from 'uuid'

import { APIGatewayEvent, APIGatewayProxyResult, Email } from '../types'
import { log, logError } from '../utils/logging'
import { addToQueue } from '../services/sqs'
import { extractEmailFromEvent } from '../utils/events'
import status from '../utils/status'
import { uploadContentsToS3 } from '../services/s3'

const processEmail = async (email: Email): Promise<APIGatewayProxyResult> => {
  try {
    const uuid = uuidv1()
    await uploadContentsToS3(uuid, JSON.stringify(email))
    await addToQueue({ uuid })
    return status.NO_CONTENT
  } catch (error) {
    logError(error)
    return status.INTERNAL_SERVER_ERROR
  }
}

export const postItem = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  log('Received event', { ...event, body: undefined })
  try {
    const email = extractEmailFromEvent(event)
    return await processEmail(email)
  } catch (error) {
    return { ...status.BAD_REQUEST, body: JSON.stringify({ message: error.message }) }
  }
}
