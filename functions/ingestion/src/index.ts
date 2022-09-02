import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda';

import { sendMessage } from '@app/services/sqs-service';
import {
  handleError,
  verifySignature,
} from '@app/utils';

import { captureRequestContext } from '@app/utils/async-local-storage';

export const handler = async(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  captureRequestContext(event);
  let messageId = '';
  try {
    // 1. Verify Signature
    verifySignature(event);
    // 2. Add to Queue
    messageId = await sendMessage(event);
  } catch (err: any) {
    // 3. Error handling (final touch)
    const errorResponse: APIGatewayProxyResult = await handleError(err);
    return errorResponse;
  }

  // 4. Response
  return {
    statusCode: 200,
    body: JSON.stringify({
      messageId,
      message: 'success'
    }),
  }
}
