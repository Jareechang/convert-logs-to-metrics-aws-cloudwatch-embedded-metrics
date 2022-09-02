import AWS from 'aws-sdk';
import {
  APIGatewayProxyEvent,
} from 'aws-lambda';

import config from '@app/config';
import logger from '@app/services/logger';

export default function getSqsMessage(
  event: APIGatewayProxyEvent,
): AWS.SQS.Types.SendMessageRequest {
  logger.info('From utils/get-sqs-message');
  return {
    MessageAttributes: {
      requestId: {
        DataType: 'String',
        StringValue: event?.requestContext?.requestId ?? '',
      }
    },
    MessageBody: event?.body ?? '',
    QueueUrl: config.queue.sqs.url ?? '',
  };
}
