import { NextFunction, Request, RequestHandler, Response } from "express";

export interface Exchange {
  exchange: () => RequestHandler;
}
