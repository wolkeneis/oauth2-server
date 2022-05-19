import { RequestHandler } from "express";
import { TokenError } from "../errors";
import OAuth2Server from "../server";

export default function (server: OAuth2Server): RequestHandler {
  return async function (req, res, next) {
    if (!req.body) {
      throw new Error("I need a body..., Did you forget app.use(express.bodyParser(...)) || app.use(express.json())?");
    }
    const grantType = req.body.grant_type;
    if (!req.body.grant_type) {
      throw new TokenError(`I need the following field to work: ${"grant_type"}`, "invalid_request");
    }

    const exchange = server.exchange(grantType);
    if (!exchange) {
      return next(new TokenError("Unsupported grant type: " + grantType, "unsupported_grant_type"));
    }
    try {
      return await exchange.exchange()(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
}
