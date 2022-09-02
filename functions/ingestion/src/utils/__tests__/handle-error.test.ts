import { handleError, captureError } from '@app/utils';

import logger from '@app/services/logger';

import {
  AwsSqsServiceError,
  VerifySignatureError
} from '@app/errors';

const mockRequestId = 'test-123';

jest.mock('@app/services/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  }
}));

jest.mock('@app/utils/capture-error', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('@app/utils/async-local-storage', () => ({
  __esModule: true,
  default: ({
    getStore: () => new Map()
      .set('awsRequestId', mockRequestId),
  })
}));

describe('utils/handle-error', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  // Unhandled error
  describe('case: unhandled error', () => {
    it('should return 500 as status code', async() => {
      const error = new Error('test');
      const errorResponse = await handleError(error);
      expect(errorResponse.statusCode).toBe(500);
    });
    it('should return the correct body response (JSON.stringify)', async() => {
      const error = new Error('test');
      const errorResponse = await handleError(error);
      expect(errorResponse.body).toBe(JSON.stringify({
        errorTrackingId: mockRequestId,
        message: error.message,
        errors: [error.message]
      }));
    });
  });

  // VerifySignatureError
  describe('case: VerifySignatureError', () => {
    it('should return 401 as status code (unauthorized)', async() => {
      const error = new VerifySignatureError('test');
      const errorResponse = await handleError(error);
      expect(errorResponse.statusCode).toBe(401);
    });
    it('should return the correct body response (JSON.stringify)', async() => {
      const error = new VerifySignatureError('test');
      const errorResponse = await handleError(error);
      expect(errorResponse.body).toBe(JSON.stringify({
        errorTrackingId: mockRequestId,
        message: error.message,
        errors: [error.message]
      }));
    });
    it('should call captureError util with the correct error and errorResponse', async() => {
      const error = new VerifySignatureError('test')
        .setContext({
          a: 'a',
          b: 'b'
        });
      const errorResponse = await handleError(error);
      expect(captureError).toBeCalledWith(error, errorResponse);
    });
  });

  // AwsSqsServiceError
  describe('case: AwsSqsServiceError', () => {
    it('should return 500 as status code', async() => {
      const error = new AwsSqsServiceError('test');
      const errorResponse = await handleError(error);
      expect(errorResponse.statusCode).toBe(500);
    });
    it('should return the correct body response (JSON.stringify)', async() => {
      const error = new AwsSqsServiceError('test');
      const errorResponse = await handleError(error);
      expect(captureError).toBeCalledWith(error, errorResponse);
    });
    it('should call captureError util with the correct error and errorResponse', async() => {
      const error = new AwsSqsServiceError('test')
        .setContext({
          a: 'a',
          b: 'b'
        });
      const errorResponse = await handleError(error);
      expect(captureError).toBeCalledWith(error, errorResponse);
    });
  });
});

