declare module "Express" {
  interface Request {
    oauth2?: OAuth2Transaction;
    session: {
      oauth2?: {
        [key: string]: OAuth2SerializedTransaction;
      };
    };
  }
}

export interface OAuth2Transaction {
  client: OAuth2Client;
  user: OAuth2User;
  redirectUri: string;
  transactionId: string;
  request: OAuth2Request;
  info?: OAuth2Info;
}

export interface OAuth2SerializedTransaction {
  clientId: string;
  redirectUri: string;
  transactionId: string;
  request: OAuth2Request;
  info?: OAuth2Info;
}

export interface OAuth2Request {
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

export type OAuth2Client = unknown;

export type OAuth2User = unknown;

export type OAuth2State = unknown;
