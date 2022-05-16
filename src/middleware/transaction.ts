import { BadRequestError } from "errors";
import { RequestHandler } from "express";
import { OAuth2Transaction } from "index";
import { OAuth2Server } from "server";
import { Session } from "session";

export default function (server: OAuth2Server): RequestHandler {
  return async function (req, _res, next) {
    const transactionId: string = req.query?.transaction_id ?? req.body?.transaction_id;
    if (!transactionId) {
      throw new BadRequestError(`I need the following field to work: ${"transaction_id"}`);
    }
    if (req.oauth2) {
      return next();
    }
    try {
      const transaction: OAuth2Transaction = await Session.load(server, req, transactionId);
      req.oauth2 = transaction;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
