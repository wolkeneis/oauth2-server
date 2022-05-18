import { RequestHandler } from "express";
import { Exchange, IssueTokenFunction, OAuth2Tokens } from "../index.js";
import { ForbiddenError, TokenError } from "../errors";

export default class CodeExchange implements Exchange {
  issue: IssueTokenFunction;

  constructor(issue: IssueTokenFunction) {
    this.issue = issue;
  }

  _type() {
    return "code";
  }

  exchange(): RequestHandler {
    const issue = this.issue;
    return async function (req, res, next) {
      if (!req.body) {
        throw new Error("I need a body..., Did you forget app.use(express.bodyParser(...)) || app.use(express.json())?");
      }

      const client = req.user;
      if (!client) {
        throw new ForbiddenError("No user found, are you sure that you're logged in?.");
      }
      const code = req.body.code,
        redirectUri = req.body.redirect_uri;

      if (!code) {
        throw new TokenError(`I need the following field to work: ${"code"}`, "invalid_request");
      }
      if (!redirectUri) {
        throw new TokenError(`I need the following field to work: ${"redirect_uri"}`, "invalid_request");
      }

      try {
        const tokens: OAuth2Tokens = await issue(client, code, redirectUri);
        if (!tokens) {
          return next(new TokenError("I denied the request because of an invalid authorization code or redirect_uri", "access_denied"));
        }
        res
          .json({
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            token_type: tokens.tokenType ?? "Bearer"
          })
          .header({
            "Cache-Control": "no-store",
            Pragma: "no-cache"
          })
          .end();
      } catch (error) {
        return next(error);
      }
    };
  }
}
