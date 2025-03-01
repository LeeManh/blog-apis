export interface JWTTokenPayload {
  userId: number;
  roleId: number;
}

export interface JWTDecodedToken extends JWTTokenPayload {
  iat: number;
  exp: number;
}

export interface ICreateToken {
  token: string;
  userId: number;
}

export enum TokenType {
  REFRESH = 'REFRESH',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
}
