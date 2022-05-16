declare global {
  namespace Express {
    interface Request {
      oauth2?: OAuth2Transaction;
      session: {
        oauth2?: {
          [key: string]: OAuth2SerializedTransaction;
        };
      };
    }
  }
}

export interface OAuth2Transaction {
  client: OAuth2Client;
  user: any;
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
  state: any;
  transactionId: string;
  type: string;
}

export interface OAuth2Info {
  allow: boolean,
  scope?: string[];
}

export type OAuth2Client = any;
