import { RequestHandler } from "express";
import { AuthorizationError, ForbiddenError } from "../errors";
import { OAuth2Transaction } from "../index.js";
import OAuth2Server from "../server";
import { remove } from "../session";

export default function (server: OAuth2Server): RequestHandler {
  return async function (req, res, next) {
    if (!req.body) {
      throw new Error("I need a body..., Did you forget app.use(express.bodyParser(...)) || app.use(express.json())?");
    }
    if (!req.oauth2) {
      throw new Error("I need a valid transaction..., Did you forget app.use(oauth2server.transaction(...))?");
    }

    const transaction: OAuth2Transaction<any, any, any> = req.oauth2;

    (transaction.info = transaction.info ?? { allow: false }).allow = !req.body.cancel || !!req.oauth2.info?.allow;

    const user = req.user;
    if (!user) {
      throw new ForbiddenError("No user found, are you sure that you're logged in?.");
    }

    res.on("finish", async () => {
      await remove(req, transaction.transactionId);
    });

    const parser = server.grant(transaction.request.type);
    if (!parser) {
      return next(new AuthorizationError(`The response type "${transaction.request.type}" is unsupported.`, "unsupported_response_type"));
    }
    try {
      return await parser.response(transaction, res, next);
    } catch (error) {
      return next(error);
    }
  };
}
