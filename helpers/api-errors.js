/* eslint-disable max-classes-per-file */

/**
 * General Error Object, gets other props from Error which include
 *
 * name, message, stack
 */
export class ErrorResponse extends Error {
  constructor(message) {
    super();
    this.name = 'Internal Server Error';
    this.errorCode = 500;
    this.message = message;
  }
}

export class AuthorizationError extends ErrorResponse {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
    this.errorCode = 401;
  }
}

export class ForbiddenError extends ErrorResponse {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.errorCode = 403;
  }
}

export class ValidationError extends ErrorResponse {
  constructor(message = 'Input Validation Error') {
    super(message);
    this.name = 'ValidationError';
    this.errorCode = 400;
  }
}
export class NotFoundError extends ErrorResponse {
  constructor(message = 'Not found.') {
    super(message);
    this.name = 'NotFoundError';
    this.errorCode = 404;
  }
}
const errors = {
  ErrorResponse,
  AuthorizationError,
  ForbiddenError,
  ValidationError,
  NotFoundError
};
export class ApiResponseError extends Error {
  static getError(errorBody) {
    let errorResponse = null;
    let message = '';
    switch (errorBody.name) {
      case 'ValidationError':
        message = errorBody.errors
          ? errorBody.errors[Object.keys(errorBody.errors)[0]].message.replace('Path', '').trim()
          : '';
        errorResponse = new ValidationError(message);
        break;

      case 'AuthorizationError':
      case 'NotFoundError':
      case 'ForbiddenError':
        message = errorBody.message || '';
        errorResponse = new errors[errorBody.name](message);
        break;

      default:
        message = errorBody.message || 'An error occured.';
        errorResponse = new ErrorResponse(errorBody.message);
    }
    return errorResponse;
  }
}
