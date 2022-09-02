import mockEvent from '@app/__mocks__/mock-event.json';
import verifySignature from '@app/utils/verify-signature';

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
    }
  }
}))

describe('verifySignature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  it('should proceed without errors if signature matches', () => {
    // @ts-ignore
    expect(() => verifySignature(mockEvent)).not.toThrow();
  });
  it('should throw errors if signature does not match', () => {
    try {
      // @ts-ignore
      verifySignature({
        ...mockEvent,
        body: '',
      })
    } catch (error: any) {
      expect(error.name).toBe('VerifySignatureError');
      expect(error.message).toBe('Signature Mis-match');
      expect(error.operation).toBe('utils/verifySignature');
      expect(error.context).toEqual({
        generatedSignature: "sha256=bce68cb87da59c708eaff17571c501dee1c4aeed50d9552f0b8644286317bcc9",
        headerSignature: "sha256=c2af8d2bc59689c28094b194bc3a38ed865c2ea4de38ca90dd6d71c61d2e12ef",
        'config.webhook.signature.header': 'x-hub-signature-256',
        'config.webhook.signature.algo': 'sha256' ,
      });
    }
  });
});
