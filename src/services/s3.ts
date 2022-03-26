import { S3 } from 'aws-sdk'

import { StringObject } from '../types'
import { emailBucket } from '../config'

const s3 = new S3({ apiVersion: '2006-03-01' })

export const putS3Object = (
  key: string,
  body: Buffer | string,
  metadata: StringObject = {}
): Promise<S3.PutObjectOutput> =>
  s3.putObject({ Body: body, Bucket: emailBucket, Key: key, Metadata: metadata }).promise()

export const uploadContentsToS3 = (uuid: string, body: Buffer | string): Promise<S3.PutObjectOutput> =>
  exports.putS3Object(`queue/${uuid}`, body)
