import { handler } from './index';
import { mockEvent } from '@app/__mocks__';
import { sqs } from '@app/services/sqs-service';
import {
  AwsSqsServiceError,
  VerifySignatureError,
} from '@app/errors';
import verifySignature from '@app/utils/verify-signature';

jest.mock('@app/utils/verify-signature', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@app/services/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  }
}));

jest.mock('aws-xray-sdk', () => ({
  __esModule: true,
  default: {
    captureAWSClient: jest.fn(),
  }
}));

jest.mock('aws-sdk', () => {
  const SqsMethods = {
    sendMessage: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  }
  const mockAwsSdk = {
    SQS: jest.fn(() => SqsMethods),
  };
  return mockAwsSdk;
});

jest.mock('@app/config', () => ({
  __esModule: true,
  default: {
    webhook: {
      signature: {
        secret: 'test123',
        algo: 'sha256',
        header: 'x-hub-signature-256'
      }
    },
    queue: {
      sqs: {
        url: 'queueUrl'
      }
    },
  }
}));

describe('lambda.handler', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it('should respond with 200 with the default message', async() => {
    (sqs.sendMessage as jest.Mock).mockReturnValue({
      promise: jest.fn(),
    });
    // @ts-ignore
    await expect(handler(mockEvent))
      .resolves
      .toEqual({
        statusCode: 200,
        body: expect.stringMatching(
          'success'
        )
      });
  });
  it('should respond with 500 if sqs fails', async() => {
    (sqs.sendMessage as jest.Mock).mockReturnValue({
      promise: jest.fn().mockImplementation(() => {
        throw new AwsSqsServiceError('test');
      }),
    });
    // @ts-ignore
    await expect(handler(mockEvent))
      .resolves
      .toEqual({
        statusCode: 500,
        body: JSON.stringify({
          errorTrackingId: mockEvent.requestContext.requestId,
          message: 'failed to sendMessage',
          errors: [
            'failed to sendMessage'
          ]
        })
      });
  });
  it('should respond with 401 if signature verification fails', async() => {
    (verifySignature as jest.Mock)
      .mockImplementation(() => {
        throw new VerifySignatureError('test')
      });
    // @ts-ignore
    await expect(handler(mockEvent))
      .resolves
      .toEqual({
        statusCode: 401,
        body: JSON.stringify({
          errorTrackingId: mockEvent.requestContext.requestId,
          message: 'test',
          errors: [
            'test'
          ]
        })
      });
  });
});
