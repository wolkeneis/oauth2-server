import { OAuth2Client } from "index";
import { Exchange } from "parsers/exchange/exchange";
import { Grant } from "parsers/grant/grant";

export type ClientSerializer = (client: OAuth2Client) => Promise<string>;
export type ClientDeserializer = (identifier: string) => Promise<OAuth2Client>;

export class OAuth2Server {
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

  addGrant(responseType: string, grant: Grant) {
    this.grants[responseType] = grant;
  }

  grant(responseType: string): Grant {
    return this.grants[responseType];
  }

  addExchange(responseType: string, exchange: Exchange) {
    this.exchanges[responseType] = exchange;
  }

  exchange(responseType: string): Exchange {
    return this.exchanges[responseType];
  }
}
