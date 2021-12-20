import { handleErrorWithDefault } from '@src/util/error-handling'
import { APIGatewayEvent } from 'aws-lambda'

import { addToQueue, formatEmail, isValidEmail, Email } from '../services/sqs'
import status from '../util/status'

export const parseEventBody = (event: APIGatewayEvent): Promise<Email> =>
  Promise.resolve(
    JSON.parse(
      event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body as string)
    )
  )

const isValidMethod = (event: APIGatewayEvent): boolean => (event.httpMethod == 'POST' ? true : false)

export const postItem = (event: APIGatewayEvent): Promise<unknown> =>
  Promise.resolve(isValidMethod(event))
    .then((isValid) =>
      isValid
        ? exports
          .parseEventBody(event)
          .then(formatEmail)
          .then((email) =>
            isValidEmail(email)
              ? addToQueue(email).then(() => status.NO_CONTENT)
              : Promise.resolve(status.BAD_REQUEST)
          )
        : status.NOT_FOUND
    )
    .catch(handleErrorWithDefault(status.INTERNAL_SERVER_ERROR))
