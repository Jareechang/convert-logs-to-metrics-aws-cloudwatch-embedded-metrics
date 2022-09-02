export type Maybe<T> = T | null;

export interface ServiceError {
  message: string;
  context: Record<string, any>;
  operation: string;
  name: string;

  setOperation: (operation: string) => ServiceError;
  setContext: (context: Record<string, any>) => ServiceError;
};

export interface ErrorLogDetails {
  // The error message
  message: string;
  // The error response sent to the client
  clientResponse: any;
  // [Optional] The specific operation called
  operation?: string;
  // [Optional] Key values of conext
  context?: Record<string, any>;
}
