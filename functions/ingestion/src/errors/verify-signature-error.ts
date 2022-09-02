import CommonError from './common-error';

class VerifySignatureError extends CommonError {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
  }
}

export default VerifySignatureError;
