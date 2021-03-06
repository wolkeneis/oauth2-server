import { Request } from "express";
import { BadRequestError, ForbiddenError } from "./errors.js";
import { OAuth2SerializedTransaction, OAuth2Transaction } from "./index.js";
import OAuth2Server from "./server.js";

export async function load(server: OAuth2Server, request: Request, transactionId: string): Promise<OAuth2Transaction<any, any, any>> {
  if (!request.session) {
    throw new Error("I need a session..., Did you forget app.use(express.session(...))?");
  }
  if (!request.session.oauth2) {
    throw new ForbiddenError("There are sessions, but there is no transaction saved here.");
  }
  const user = request.user;
  if (!user) {
    throw new ForbiddenError("No user found, are you sure that you're logged in?.");
  }
  const serializedTransaction: OAuth2SerializedTransaction<any> = request.session.oauth2[transactionId];
  if (!serializedTransaction) {
    throw new BadRequestError(`I can't find a transaction with ${serializedTransaction} as the transaction identifier.`);
  }
  const client = await server.deserializeClient(serializedTransaction.clientId);
  const transaction: OAuth2Transaction<any, any, any> = {
    client: client,
    user: user,
    redirectUri: serializedTransaction.redirectUri,
    transactionId: transactionId,
    info: serializedTransaction.info,
    request: serializedTransaction.request
  };
  return transaction;
}
export async function store(server: OAuth2Server, request: Request, transaction: OAuth2Transaction<any, any, any>): Promise<void> {
  if (!request.session) {
    throw new Error("I need a session..., Did you forget app.use(express.session(...))?");
  }
  const clientId = await server.serializeClient(transaction.client);
  const serializedTransaction: OAuth2SerializedTransaction<any> = {
    clientId: clientId,
    redirectUri: transaction.redirectUri,
    transactionId: transaction.transactionId,
    info: transaction.info,
    request: transaction.request
  };
  (request.session.oauth2 = request.session.oauth2 ?? {})[transaction.transactionId] = serializedTransaction;
}
export async function remove(request: Request, transactionId: string): Promise<void> {
  if (!request.session) {
    throw new Error("I need a session..., Did you forget app.use(express.session(...))?");
  }
  if (request.session.oauth2) {
    delete request.session.oauth2[transactionId];
  }
}
