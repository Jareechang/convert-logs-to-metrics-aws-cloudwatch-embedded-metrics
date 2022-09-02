import {
  APIGatewayProxyEvent,
} from 'aws-lambda';
import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage: any = new AsyncLocalStorage();

export default asyncLocalStorage;

export function captureRequestContext(
  event: APIGatewayProxyEvent,
): void {
  const context = new Map();
  context.set('awsRequestId', event?.requestContext?.requestId);
  asyncLocalStorage.enterWith(context);
}
