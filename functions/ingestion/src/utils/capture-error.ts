import {
  APIGatewayProxyResult
} from 'aws-lambda';
import { CommonError } from '@app/errors';
import { ServiceError, LogDetails } from '@app/types';
import { sendErrorMetrics } from '@app/utils';
import logger from '@app/services/logger';

/**
*
* An utility function that captures the errors through logging and metrics
*
*/
async function captureError(
  error: ServiceError | Error,
  response: APIGatewayProxyResult,
): Promise<void> {
  let logDetails: LogDetails = {
    clientResponse: response,
    message: error.message
  };
  if (error instanceof CommonError) {
    logDetails.operation = error.operation;
    logDetails.context = error.context;
  }
  try {
    await sendErrorMetrics(logDetails);
  } catch (err: any) {
    // fallback to default logger
    logger.error({
      operation: 'captureError#sendErrorMetrics',
      context: {
        logDetails,
      }
    });
  }
}

export default captureError;
