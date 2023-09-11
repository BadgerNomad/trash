export enum NotFoundExceptionMessage {
  NOT_FOUND = 'Errors.NotFound',
  OPERATION_NOT_FOUND = 'Errors.OperationNotFound',
}

export enum BadRequestExceptionMessage {
  BAD_REQUEST = 'Errors.BadRequest',
  USER_ALREADY_EXISTS = 'Errors.UserAlreadyExists',
  PASSWORD_IS_NOT_VALID = 'Errors.Password must be at least 8 characters long and must contain at least one uppercase character, a number and a special character',
}

export enum ForbiddenExceptionMessage {
  NOT_VERIFY = 'Errors.NotVerify',
  PERMISSION_DENIED = 'Errors.PermissionDenied',
  WRONG_PASSWORD = 'Errors.WrongPassword',
}

export enum TooManyRequestsMessage {
  TOO_MANY_REQUESTS = 'Errors.TooManyRequests',
}

export enum UnauthorizedExceptionMessage {
  INVALID_SESSION = 'Errors.InvalidSession',
  UNAUTHORIZED = 'Errors.Unauthorized',
}
