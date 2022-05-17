import { OAuth2Client } from "index";
import { Parser } from "parsers/parser";

export type ClientSerializer = (client: OAuth2Client) => Promise<string>;
export type ClientDeserializer = (identifier: string) => Promise<OAuth2Client>;

export enum types {
  grant = "_grants",
  exchange = "_exchanges"
}

export class OAuth2Server {
  private _clientSerializer: ClientSerializer;
  private _clientDeserializer: ClientDeserializer;
  private _grants: {
    [key: string]: Parser;
  };
  private _exchanges: {
    [key: string]: Parser;
  };

  constructor(clientSerializer: ClientSerializer, clientDeserializer: ClientDeserializer) {
    this._clientSerializer = clientSerializer;
    this._clientDeserializer = clientDeserializer;
    this._grants = {};
    this._exchanges = {};
  }

  async serializeClient(client: OAuth2Client): Promise<string> {
    return await this._clientSerializer(client);
  }

  async deserializeClient(identifier: string): Promise<OAuth2Client> {
    return await this._clientDeserializer(identifier);
  }

  addParser(type: types, responseType: string, parser: Parser) {
    this[type][responseType] = parser;
  }

  getParser(type: types, responseType: string): Parser | undefined {
    return this[type][responseType];
  }
}
