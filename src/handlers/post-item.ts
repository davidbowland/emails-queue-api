import { APIGatewayEvent } from 'aws-lambda'
import { v1 as uuidv1 } from 'uuid'

import { uploadContentsToS3 } from '../services/s3'
import { addToQueue, formatEmail, isValidEmail, Email } from '../services/sqs'
import { handleErrorWithDefault } from '../util/error-handling'
import status from '../util/status'

export const parseEventBody = (event: APIGatewayEvent): Promise<Email> =>
  Promise.resolve(
    JSON.parse(
      event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body as string)
    )
  )

const processEmail = (email: Email) =>
  Promise.resolve(uuidv1()).then((uuid) =>
    uploadContentsToS3(uuid, JSON.stringify(email))
      .then(() => addToQueue({ uuid }))
      .then(() => status.NO_CONTENT)
  )

const isValidMethod = (event: APIGatewayEvent): boolean => (event.httpMethod == 'POST' ? true : false)

export const postItem = (event: APIGatewayEvent): Promise<unknown> =>
  Promise.resolve((console.log('Received event', { ...event, body: undefined }), isValidMethod(event)))
    .then((isValidMethod) =>
      isValidMethod
        ? exports
          .parseEventBody(event)
          .then(formatEmail)
          .then((email) => (isValidEmail(email) ? processEmail(email) : Promise.resolve(status.BAD_REQUEST)))
        : status.NOT_FOUND
    )
    .catch(handleErrorWithDefault(status.INTERNAL_SERVER_ERROR))
