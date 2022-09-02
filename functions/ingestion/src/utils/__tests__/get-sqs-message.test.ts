import getSqsMessage from '@app/utils/get-sqs-message';
import { mockEvent } from '@app/__mocks__';

jest.mock('@app/services/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
  }
}));

jest.mock('@app/utils/async-local-storage', () => ({
  __esModule: true,
  default: {
    getStore: () => ({
      get: () => ''
    })
  }
}));

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
}))

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
}))

describe('getSqsMessage', () => {
  it('should return with the correct "MessageAttributes.requestId"', () => {
    const mockRequestId = 'mockRequestId';
    const message = getSqsMessage({
      ...mockEvent,
      // @ts-ignore
      requestContext: {
        requestId: mockRequestId
      }
    });
    expect(message?.MessageAttributes?.requestId).toEqual({
      DataType: 'String',
      StringValue: mockRequestId
    });
  });
  it('should return with the correct "MessageBody"', () => {
    const mockMessage = 'test-message';
    // @ts-ignore
    const message = getSqsMessage({
      ...mockEvent,
      body: mockMessage,
    });
    expect(message?.MessageBody).toEqual(mockMessage);
  });
  it('should return with the correct "QueueUrl"', () => {
    // @ts-ignore
    const message = getSqsMessage(mockEvent);
    expect(message?.QueueUrl).toEqual('queueUrl');
  });
});
