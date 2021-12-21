import { S3 } from 'aws-sdk'

import { emailBucket } from '../config'

const s3 = new S3({ apiVersion: '2006-03-01' })

export interface Metadata {
  [key: string]: string
}

/* Put */

export const putS3Object = (key: string, body: Buffer | string, metadata: Metadata = {}): Promise<S3.PutObjectOutput> =>
  s3.putObject({ Body: body, Bucket: emailBucket, Key: key, Metadata: metadata }).promise()
