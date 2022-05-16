import { AuthorizationError } from "errors";
import { Response, NextFunction, Request } from "express";
import { OAuth2Request, OAuth2Transaction } from "index";
import { Parser } from "parsers/parser";
import { v4 as uuidv4 } from "uuid";

export class CodeParser implements Parser {
  constructor() {}

  async request(request: Request): Promise<OAuth2Request> {
    var clientId = request.query.client_id,
      redirectUri = request.query.redirect_uri,
      scope = request.query.scope,
      state = request.query.state;

    if (!clientId) {
      throw new AuthorizationError(`I need the following field to work: ${"client_id"}`, "invalid_request");
    }
    if (typeof clientId !== "string") {
      throw new AuthorizationError(`The following field has to be a string: ${"client_id"}`, "invalid_request");
    }
    if (typeof redirectUri !== "string") {
      throw new AuthorizationError(`The following field has to be a string: ${"redirect_uri"}`, "invalid_request");
    }
    if (scope) {
      if (typeof scope !== "string") {
      throw new AuthorizationError(`The following field has to be a string: ${"scope"}`, "invalid_request");
      }
      scope = scope.split(" ");
    }
    return {
      type: "code",
      transactionId: uuidv4(),
      clientId: clientId,
      redirectUri: redirectUri,
      scope: scope as string[],
      state: state
    };
  }
  async response(transaction: OAuth2Transaction, response: Response): Promise<void> {}
  async errorHandler(error: Error, transaction: OAuth2Transaction, response: Response, next: NextFunction): Promise<void> {}
}
