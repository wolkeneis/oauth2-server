import { AuthorizationError } from "../errors";
import { RequestHandler } from "express";
import { ImmediateFunction, OAuth2Client, OAuth2Request, OAuth2Transaction, ValidateFunction } from "../index.js";
import OAuth2Server from "../server";
import { store } from "../session";

export default function (server: OAuth2Server, validate: ValidateFunction, immediate: ImmediateFunction): RequestHandler {
  return async function (req, res, next) {
    const type: string = req.query?.response_type ?? req.body?.response_type;
    if (!type) {
      return next(new AuthorizationError(`I need the following field to work: ${"response_type"}`, "invalid_request"));
    }
    const parser = server.grant(type);
    if (!parser) {
      return next(new AuthorizationError(`The response type "${type}" is unsupported.`, "unsupported_response_type"));
    }
    let parsedRequest: OAuth2Request<any>;
    try {
      parsedRequest = await parser.request(req);
    } catch (error) {
      return next(error);
    }
    let client: OAuth2Client;
    try {
      client = await validate(parsedRequest);
    } catch (error) {
      return next(error);
    }
    const transaction: OAuth2Transaction<any, any, any> = {
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
      const parser = server.grant(type);
      if (!parser) {
        return next(new AuthorizationError(`The response type "${type}" is unsupported.`, "unsupported_response_type"));
      }
      try {
        return await parser.response(transaction, res, next);
      } catch (error) {
        return next(error);
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
