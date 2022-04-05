#!/usr/bin/env bash

# Stop immediately on error
set -e

if [[ -z "$1" ]]; then
  $(./scripts/assumeDeveloperRole.sh)
fi

# Only install production modules
export NODE_ENV=production

# Build the project
SAM_TEMPLATE=template.yaml
sam build --template ${SAM_TEMPLATE}

# Start the API locally
export EMAIL_BUCKET=emails-service-storage-test
export EMAIL_REGION=us-east-1
export SQS_MESSAGE_QUEUE_ID=emails
export SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/$AWS_ACCOUNT_ID/emails-queue-service-test-SimpleQueue-1RVBFSJJJDFXF.fifo
sam local start-api --region=us-east-1 --force-image-build --parameter-overrides "Environment=test" --log-file local.log
