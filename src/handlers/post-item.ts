import { v1 as uuidv1 } from 'uuid'

import { uploadContentsToS3 } from '../services/s3'
import { addToQueue } from '../services/sqs'
import { APIGatewayEvent, APIGatewayProxyResult, Email } from '../types'
import { extractEmailFromEvent } from '../utils/events'
import { logErrorWithDefault, log } from '../utils/logging'
import status from '../utils/status'

const processEmail = (email: Email): Promise<APIGatewayProxyResult> =>
  Promise.resolve(uuidv1())
    .then((uuid) =>
      uploadContentsToS3(uuid, JSON.stringify(email))
        .then(() => addToQueue({ uuid }))
        .then(() => status.NO_CONTENT)
    )
    .catch(logErrorWithDefault(status.INTERNAL_SERVER_ERROR))

export const postItem = (event: APIGatewayEvent): Promise<APIGatewayProxyResult> =>
  log('Received event', { ...event, body: undefined })
    .then(() => extractEmailFromEvent(event).then(processEmail))
    .catch((err) => ({ ...status.BAD_REQUEST, body: JSON.stringify({ message: err }) }))
