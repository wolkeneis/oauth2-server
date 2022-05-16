export class BadRequestError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
    this.status = 400;
  }
}
export class ForbiddenError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
    this.status = 403;
  }
}
class OAuth2Error extends Error {
  code: string;
  uri?: string;
  status: number;

  constructor(message: string, code?: string, uri?: string, status?: number) {
    super(message);
    this.code = code ?? "server_error";
    this.uri = uri;
    this.status = status ?? 500;
  }
}
export class AuthorizationError extends OAuth2Error {
  constructor(message: string, code?: string, uri?: string, status?: number) {
    if (!status) {
      switch (code) {
        case "invalid_request":
          status = 400;
          break;
        case "invalid_scope":
          status = 400;
          break;
        case "access_denied":
          status = 403;
          break;
        case "unauthorized_client":
          status = 403;
          break;
        case "unsupported_response_type":
          status = 501;
          break;
        case "temporarily_unavailable":
          status = 503;
          break;
      }
    }
    super(message, code, uri, status);
    this.name = "AuthorizationError";
  }
}

export class TokenError extends OAuth2Error {
  constructor(message: string, code?: string, uri?: string, status?: number) {
    if (!status) {
      switch (code) {
        case "invalid_request":
          status = 400;
          break;
        case "invalid_scope":
          status = 400;
          break;
        case "invalid_client":
          status = 401;
          break;
        case "unauthorized_client":
          status = 403;
          break;
        case "invalid_grant":
          status = 403;
          break;
        case "unsupported_grant_type":
          status = 501;
          break;
      }
    }
    super(message, code, uri, status);
    this.name = "TokenError";
  }
}
