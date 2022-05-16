import { NextFunction, Request, Response } from "express";
import { OAuth2Request, OAuth2Transaction } from "index";

export interface Parser {
  request: (request: Request) => Promise<OAuth2Request>;
  response: (transaction: OAuth2Transaction, response: Response) => Promise<void>;
  errorHandler: (error: Error, transaction: OAuth2Transaction, response: Response, next: NextFunction) => Promise<void>;
}
