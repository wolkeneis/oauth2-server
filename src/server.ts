import { OAuth2Client } from "index";

type ClientSerializer = (client: OAuth2Client) => Promise<string>;
type ClientDeserializer = (identifier: string) => Promise<OAuth2Client>;

export class OAuth2Server {
  _clientSerializer: ClientSerializer;
  _clientDeserializer: ClientDeserializer;

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
};
