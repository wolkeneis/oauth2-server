import { NextFunction, Request, RequestHandler, Response } from "express-serve-static-core";
import CodeExchange from "./exchange/code.js";
import CodeGrant from "./grant/code.js";
import OAuth2Server from "./server.js";

declare module "express-serve-static-core" {
  interface Request {
    oauth2?: OAuth2Transaction<any, any, any>;
    session: {
      oauth2?: {
        [key: string]: OAuth2SerializedTransaction<any>;
      };
    };
  }
}
export { OAuth2Server, CodeGrant, CodeExchange };

export interface OAuth2Transaction<OAuth2Client, OAuth2User, OAuth2State> {
  client: OAuth2Client;
  user: OAuth2User;
  redirectUri: string;
  transactionId: string;
  request: OAuth2Request<OAuth2State>;
  info?: OAuth2Info;
}

export interface OAuth2SerializedTransaction<OAuth2State> {
  clientId: string;
  redirectUri: string;
  transactionId: string;
  request: OAuth2Request<OAuth2State>;
  info?: OAuth2Info;
}

export interface OAuth2Request<OAuth2State> {
  clientId: string;
  redirectUri: string;
  scope: string[];
  state: OAuth2State;
  transactionId: string;
  type: string;
}

export interface OAuth2Info {
  allow: boolean;
  scope?: string[];
}

export type OAuth2Tokens = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
} | null;

export type OAuth2Client = any;

export type OAuth2User = any;

export type OAuth2State = any;

export type IssueTokenFunction = (client: OAuth2Client, code: string, redirectUri: string) => Promise<OAuth2Tokens>;

export type IssueCodeFunction = (transaction: OAuth2Transaction<any, any, any>) => Promise<string>;

export type ValidateFunction = (request: OAuth2Request<any>) => Promise<OAuth2Client>;

export type ImmediateFunction = (transaction: OAuth2Transaction<any, any, any>) => Promise<OAuth2Info>;

export type ClientSerializer = (client: OAuth2Client) => Promise<string>;
export type ClientDeserializer = (identifier: string) => Promise<OAuth2Client>;

export interface Grant {
  _type: () => string;
  request: (request: Request) => Promise<OAuth2Request<any>>;
  response: (transaction: OAuth2Transaction<any, any, any>, response: Response, next: NextFunction) => Promise<void>;
  errorHandler: (error: Error, transaction: OAuth2Transaction<any, any, any>, response: Response, next: NextFunction) => Promise<void>;
}

export interface Exchange {
  _type: () => string;
  exchange: () => RequestHandler;
}
