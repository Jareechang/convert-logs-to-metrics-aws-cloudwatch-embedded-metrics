import captureError from '@app/utils/capture-error';
import { VerifySignatureError } from '@app/errors';
import { LogDetails } from '@app/types';
import sendErrorMetrics from '@app/utils/metrics/send-error-metrics.ts';
import logger from '@app/services/logger';

jest.mock('@app/utils/metrics/send-error-metrics.ts', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@app/services/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  }
}));

describe('utils/captureError', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  describe('sendErrorMetrics', () => {
    it('should call metrics function with the correct log details', async() => {
      const error = new Error('mock error');
      const response = {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message,
        })
      };
      await captureError(error, response);
      expect(sendErrorMetrics).toBeCalledWith({
        message: error.message,
        clientResponse: response,
      });
    });
    it('should include other log metadata when it exists (operation, context)', async() => {
      const error = new VerifySignatureError('mock error')
        .setOperation('mockOperation')
        .setContext({
          a: 'a',
          b: 'b',
        });
      const response = {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message,
        })
      };
      await captureError(error, response);
      expect(sendErrorMetrics).toBeCalledWith({
        context: {
          a: 'a',
          b: 'b',
        },
        operation: 'mockOperation',
        message: error.message,
        clientResponse: response,
      });
    });
  });
  describe('fallback: default logger', () => {
    it('should call the logger with the correct log details', async() => {
      sendErrorMetrics.mockImplementation(() => {
        throw new Error('sendErrorMetrics failed');
      });
      const error = new Error('mock error');
      const response = {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message,
        })
      };
      await captureError(error, response);
      expect(logger.error).toBeCalledWith({
        operation: 'captureError#sendErrorMetrics',
        context: {
          logDetails: {
            clientResponse: response,
            message: error.message,
          },
        }
      });
    });
    it('should include other log metadata when it exists (operation, context)', async() => {
      sendErrorMetrics.mockImplementation(() => {
        throw new Error('sendErrorMetrics failed');
      });
      const error = new VerifySignatureError('mock error')
        .setOperation('mockOperation')
        .setContext({
          a: 'a',
          b: 'b',
        });
      const response = {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message,
        })
      };
      await captureError(error, response);
      expect(logger.error).toBeCalledWith({
        operation: 'captureError#sendErrorMetrics',
        context: {
          logDetails: {
            context: {
              a: 'a',
              b: 'b',
            },
            operation: 'mockOperation',
            clientResponse: response,
            message: error.message,
          },
        }
      });
    });
  });
});
