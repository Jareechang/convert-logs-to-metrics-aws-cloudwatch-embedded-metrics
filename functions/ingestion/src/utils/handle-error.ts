
import {
  APIGatewayProxyResult
} from 'aws-lambda';

import {
  CommonError,
  AwsSqsServiceError,
  VerifySignatureError,
} from '@app/errors';

import logger from '@app/services/logger';
import asyncLocalStorage from '@app/utils/async-local-storage';
import { captureError } from '@app/utils';

import { ServiceError } from '@app/types';

export default async function handleError(
  error: ServiceError | Error
) : Promise<APIGatewayProxyResult> {
  const requestId: string = asyncLocalStorage.getStore().get('awsRequestId');
  const response : any = {
    statusCode: 500,
    body: {
      errorTrackingId: requestId,
      message: 'Something went wrong',
      errors: []
    },
  };
  switch (error.constructor.name) {
    // Authentication failure or signature mis-match
    case VerifySignatureError.name:
      response.statusCode = 401;
      break;
    // SQS error - server error
    case AwsSqsServiceError.name:
      break;
    default:
      break;
  }
  response.body.message = error.message;
  response.body.errors.push(error.message);
  response.body = JSON.stringify(response.body);
  // Logging & Metrics
  await captureError(error, response)
  return response;
}
