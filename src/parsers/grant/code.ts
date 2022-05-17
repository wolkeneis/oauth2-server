import { AuthorizationError } from "errors";
import { NextFunction, Request, Response } from "express";
import { OAuth2Request, OAuth2Transaction } from "index";
import { Parser } from "parsers/parser";
import { v4 as uuidv4 } from "uuid";

export type IssueCodeFunction = (transaction: OAuth2Transaction) => Promise<string>;

export class CodeParser implements Parser {
  issue: IssueCodeFunction;

  constructor(issue: IssueCodeFunction) {
    this.issue = issue;
  }

  async request(request: Request): Promise<OAuth2Request> {
    const clientId = request.query.client_id,
      redirectUri = request.query.redirect_uri,
      state = request.query.state;

    let scope = request.query.scope;

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
  async response(_transaction: OAuth2Transaction, _response: Response): Promise<void> {
    throw new Error("Unimplemented.");
  }
  async errorHandler(_error: Error, _transaction: OAuth2Transaction, _response: Response, _next: NextFunction): Promise<void> {
    throw new Error("Unimplemented.");
  }
}
