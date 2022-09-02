import AWS from 'aws-sdk';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getSqsMessage } from '@app/utils';
import config from '@app/config';
import logger from '@app/services/logger';
import { AwsSqsServiceError } from '@app/errors';
import AWSXRay from 'aws-xray-sdk';

export const sqs = new AWS.SQS({
  apiVersion: '2012-11-05',
  region: config.queue.sqs.defaultRegion,
});

// Capture the client
AWSXRay.captureAWSClient(sqs);

/*
 * adds an event message to the queue
 *
 * **/
export async function sendMessage(
  event: APIGatewayProxyEvent
): Promise<string> {
  const message: AWS.SQS.Types.SendMessageRequest = getSqsMessage(event);
  logger.info('From service/sqs-service#sendMessage');
  try {
    const result: AWS.SQS.Types.SendMessageResult = (
      await sqs.sendMessage(message).promise());
    return result?.MessageId ?? '';
  } catch (error: any) {
    throw new AwsSqsServiceError('failed to sendMessage')
      .setOperation('services/sqs-service:sendMessage')
      .setContext({
        error,
        message,
      });
  }
}
