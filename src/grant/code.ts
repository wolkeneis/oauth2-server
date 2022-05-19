import { NextFunction, Request, Response } from "express";
import { stringify } from "querystring";
import { v4 as uuidv4 } from "uuid";
import { AuthorizationError } from "../errors";
import { Grant, IssueCodeFunction, OAuth2Request, OAuth2Transaction } from "../index.js";

export default class CodeGrant implements Grant {
  issue: IssueCodeFunction;

  constructor(issue: IssueCodeFunction) {
    this.issue = issue;
  }

  _type() {
    return "code";
  }

  async request(request: Request): Promise<OAuth2Request<any>> {
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
  async response(transaction: OAuth2Transaction<any, any, any>, response: Response, next: NextFunction): Promise<void> {
    if (!transaction.info?.allow) {
      return response.redirect(`${transaction.redirectUri}?${stringify({ error: "access_denied" })}`);
    }
    try {
      const code = await this.issue(transaction);
      if (!code) {
        return next(new AuthorizationError("I denied the request.", "access_denied"));
      }
      return response.redirect(`${transaction.redirectUri}?${stringify({ code: code })}`);
    } catch (error) {
      return next(error);
    }
  }
  async errorHandler(error: Error, transaction: OAuth2Transaction<any, any, any>, response: Response, next: NextFunction): Promise<void> {
    if (!this._isAuthorizationError(error)) {
      return next(error);
    }
    return response.redirect(
      `${transaction.redirectUri}?${stringify({ error: error.code, error_description: error.message, error_uri: error.uri })}`
    );
  }

  _isAuthorizationError(error: Error): error is AuthorizationError {
    return (error as AuthorizationError).code != undefined;
  }
}
