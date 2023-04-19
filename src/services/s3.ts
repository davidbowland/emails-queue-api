import { PutObjectCommand, PutObjectOutput, S3Client } from '@aws-sdk/client-s3'

import { emailBucket, environment } from '../config'
import { StringObject } from '../types'
import { xrayCapture } from '../utils/logging'

const s3 = xrayCapture(new S3Client({ apiVersion: '2006-03-01' }))

export const putS3Object = async (
  key: string,
  body: Buffer | string,
  metadata: StringObject = {}
): Promise<PutObjectOutput> => {
  const command = new PutObjectCommand({
    Body: body,
    Bucket: emailBucket,
    Key: key,
    Metadata: metadata,
    Tagging: `Environment=${environment}`,
  })
  return s3.send(command)
}

export const uploadContentsToS3 = (uuid: string, body: Buffer | string): Promise<PutObjectOutput> =>
  exports.putS3Object(`queue/${uuid}`, body)
