import { APIGatewayEvent, BounceData, Email } from '@types'

export const email: Email = {
  attachments: undefined,
  bcc: ['bcc@domain.com'],
  cc: ['cc@domain.com'],
  from: 'do-not-reply@domain.com',
  headers: {
    From: 'do-not-reply@domain.com',
  },
  html: '<p>Hello, world</p>',
  inReplyTo: undefined,
  references: [],
  replyTo: 'dave@domain.com',
  sender: 'do-not-reply@domain.com',
  subject: 'Hi there!',
  text: 'Hello, world',
  to: ['david@domain.com'],
}

export const event: APIGatewayEvent = {
  body: JSON.stringify(email),
  headers: {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'en-US,en;q=0.8',
    'Cache-Control': 'max-age=0',
    'CloudFront-Forwarded-Proto': 'https',
    'CloudFront-Is-Desktop-Viewer': 'true',
    'CloudFront-Is-Mobile-Viewer': 'false',
    'CloudFront-Is-SmartTV-Viewer': 'false',
    'CloudFront-Is-Tablet-Viewer': 'false',
    'CloudFront-Viewer-Country': 'US',
    Host: '1234567890.execute-api.us-east-1.amazonaws.com',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Custom User Agent String',
    Via: '1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)',
    'X-Amz-Cf-Id': 'cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA==',
    'X-Forwarded-For': '127.0.0.1, 127.0.0.2',
    'X-Forwarded-Port': '443',
    'X-Forwarded-Proto': 'https',
  },
  httpMethod: 'POST',
  multiValueHeaders: {
    Accept: ['text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'],
    'Accept-Encoding': ['gzip, deflate, sdch'],
    'Accept-Language': ['en-US,en;q=0.8'],
    'Cache-Control': ['max-age=0'],
    'CloudFront-Forwarded-Proto': ['https'],
    'CloudFront-Is-Desktop-Viewer': ['true'],
    'CloudFront-Is-Mobile-Viewer': ['false'],
    'CloudFront-Is-SmartTV-Viewer': ['false'],
    'CloudFront-Is-Tablet-Viewer': ['false'],
    'CloudFront-Viewer-Country': ['US'],
    Host: ['0123456789.execute-api.us-east-1.amazonaws.com'],
    'Upgrade-Insecure-Requests': ['1'],
    'User-Agent': ['Custom User Agent String'],
    Via: ['1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)'],
    'X-Amz-Cf-Id': ['cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA=='],
    'X-Forwarded-For': ['127.0.0.1, 127.0.0.2'],
    'X-Forwarded-Port': ['443'],
    'X-Forwarded-Proto': ['https'],
  },
  multiValueQueryStringParameters: {
    foo: ['bar'],
  },
  path: '/path/to/resource',
  pathParameters: {
    proxy: '/path/to/resource',
  },
  queryStringParameters: {
    foo: 'bar',
  },

  requestContext: {
    accountId: '123456789012',
    apiId: '1234567890',
    httpMethod: 'POST',
    identity: {
      accessKey: null,
      accountId: null,
      caller: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,

      sourceIp: '127.0.0.1',

      user: null,

      userAgent: 'Custom User Agent String',
      userArn: null,
    },
    path: '/prod/path/to/resource',
    protocol: 'HTTP/1.1',

    requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
    requestTime: '09/Apr/2015:12:34:56 +0000',
    requestTimeEpoch: 1428582896000,

    resourceId: '123456',
    resourcePath: '/{proxy+}',
    stage: 'prod',
  },
  resource: '/{proxy+}',
  stageVariables: {
    baz: 'qux',
  },
} as unknown as APIGatewayEvent

export const messageBuffer = Buffer.from(JSON.stringify(email))

export const bounceData: BounceData = {
  action: 'failed',
  bounceSender: 'bounce@domain.com',
  bounceType: 'DoesNotExist',
  messageId: 'test-message-id-123',
  recipients: ['failed-recipient@domain.com'],
  status: '5.1.1',
}

export const uuid = 'aaaaa-uuuuu-uuuuu-iiiii-ddddd'
