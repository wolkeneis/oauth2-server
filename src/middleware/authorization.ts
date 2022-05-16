import { AuthorizationError } from "errors";
import { RequestHandler } from "express";
import { OAuth2Client, OAuth2Info, OAuth2Request, OAuth2Transaction } from "index";
import { CodeParser } from "parsers/grant/code";
import { OAuth2Server } from "server";
import { store } from "session";

export type ValidateFunction = (request: OAuth2Request) => Promise<OAuth2Client>;

export type ImmediateFunction = (transaction: OAuth2Transaction) => Promise<OAuth2Info>;

export default function (server: OAuth2Server, validate: ValidateFunction, immediate: ImmediateFunction): RequestHandler {
  return async function (req, res, next) {
    const type: string = req.query?.response_type ?? req.body?.response_type;
    if (!type) {
      return next(new AuthorizationError(`I need the following field to work: ${"response_type"}`, "invalid_request"));
    }
    let parsedRequest: OAuth2Request;
    switch (type) {
      case "code":
        try {
          parsedRequest = await new CodeParser().request(req);
        } catch (error) {
          return next(error);
        }
        break;
      default:
        return next(new AuthorizationError(`The response type "${type}" is unsupported.`, "unsupported_response_type"));
    }
    let client: OAuth2Client;
    try {
      client = await validate(parsedRequest);
    } catch (error) {
      return next(error);
    }
    const transaction: OAuth2Transaction = {
      client: client,
      user: req.user,
      redirectUri: parsedRequest.redirectUri,
      transactionId: parsedRequest.transactionId,
      request: parsedRequest
    };
    try {
      transaction.info = await immediate(transaction);
    } catch (error) {
      return next(error);
    }
    if (!transaction.info) {
      return next(new AuthorizationError("An internal server error occurred."));
    }
    if (transaction.info.allow) {
      switch (type) {
        case "code":
          try {
            return await new CodeParser().response(transaction, res);
          } catch (error) {
            return next(error);
          }
        default:
          return next(new AuthorizationError(`The response type "${type}" is unsupported.`, "unsupported_response_type"));
      }
    } else {
      try {
        await store(server, req, transaction);
        req.oauth2 = transaction;
        return next();
      } catch (error) {
        return next(error);
      }
    }
  };
}
