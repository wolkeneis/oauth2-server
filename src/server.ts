import { RequestHandler } from "express-serve-static-core";
import authorization from "./middleware/authorization";
import decision from "./middleware/decision";
import token from "./middleware/token";
import transaction from "./middleware/transaction";
import { ClientDeserializer, ClientSerializer, Exchange, Grant, ImmediateFunction, OAuth2Client, ValidateFunction } from "./index.js";

export default class OAuth2Server {
  private _clientSerializer: ClientSerializer;
  private _clientDeserializer: ClientDeserializer;
  grants: {
    [key: string]: Grant;
  } = {};
  exchanges: {
    [key: string]: Exchange;
  } = {};

  constructor(clientSerializer: ClientSerializer, clientDeserializer: ClientDeserializer) {
    this._clientSerializer = clientSerializer;
    this._clientDeserializer = clientDeserializer;
  }

  async serializeClient(client: OAuth2Client): Promise<string> {
    return await this._clientSerializer(client);
  }

  async deserializeClient(identifier: string): Promise<OAuth2Client> {
    return await this._clientDeserializer(identifier);
  }

  addGrant(grant: Grant) {
    this.grants[grant._type()] = grant;
  }

  grant(responseType: string): Grant {
    return this.grants[responseType];
  }

  addExchange(exchange: Exchange) {
    this.exchanges[exchange._type()] = exchange;
  }

  exchange(responseType: string): Exchange {
    return this.exchanges[responseType];
  }

  authorization(validate: ValidateFunction, immediate: ImmediateFunction): RequestHandler {
    return authorization(this, validate, immediate);
  }

  decision(): RequestHandler {
    return decision(this);
  }

  token(): RequestHandler {
    return token(this);
  }

  transaction(): RequestHandler {
    return transaction(this);
  }
}
