import { ServiceError } from '@app/types';

class CommonError extends Error implements ServiceError {
  public operation: string = '';
  public context: Record<string, any> = {};
  public message: string = '';
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public setOperation(operation: string): any {
    this.operation = operation;
    return this;
  }

  public setContext(context: Record<string, any>): any {
    this.context = context;
    return this;
  }
}

export default CommonError;
