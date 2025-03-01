/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import {
  ICreateToken,
  JWTDecodedToken,
  JWTTokenPayload,
  TokenType,
} from './types/token.type';
import { TokenRepository } from './token.repository';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenRepository: TokenRepository,
  ) {}

  /* ----------------------------- Generate token ----------------------------- */
  generateToken<T extends Buffer | object>(
    payload: T,
    options?: JwtSignOptions,
  ): string {
    return this.jwtService.sign(payload, options);
  }
  generateAccessToken(payload: JWTTokenPayload): string {
    return this.generateToken(payload, {
      secret: this.configService.get<string>('jwt.access.secret'),
      expiresIn: this.configService.get<string>('jwt.access.expiresIn'),
    });
  }
  generateRefreshToken(payload: JWTTokenPayload): string {
    return this.generateToken(payload, {
      secret: this.configService.get<string>('jwt.refresh.secret'),
      expiresIn: this.configService.get<string>('jwt.refresh.expiresIn'),
    });
  }
  generateEmailVerificationToken(payload: JWTTokenPayload): string {
    return this.generateToken(payload, {
      secret: this.configService.get<string>('jwt.email.secret'),
      expiresIn: this.configService.get<string>('jwt.email.expiresIn'),
    });
  }
  async generateAndStoreTokens({ userId, roleId }: JWTTokenPayload) {
    const jwtTokenPayload: JWTTokenPayload = { userId, roleId };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(jwtTokenPayload),
      this.generateRefreshToken(jwtTokenPayload),
    ]);

    await this.saveRefreshToken({
      token: refreshToken,
      userId,
    });

    return { accessToken, refreshToken };
  }

  /* ----------------------------- Verify token ----------------*/
  verifyToken(token: string, options?: JwtVerifyOptions): JWTDecodedToken {
    return this.jwtService.verify(token, options);
  }
  verifyAccessToken(token: string) {
    return this.verifyToken(token, {
      secret: this.configService.get<string>('jwt.access.secret'),
    });
  }
  verifyRefreshToken(token: string) {
    return this.verifyToken(token, {
      secret: this.configService.get<string>('jwt.refresh.secret'),
    });
  }
  verifyEmailVerificationToken(token: string) {
    return this.verifyToken(token, {
      secret: this.configService.get<string>('jwt.email.secret'),
    });
  }

  /* ----------------------------- Token operations ----------------------------- */
  async saveRefreshToken(data: ICreateToken) {
    const { token, userId } = data;

    const decodedRefreshToken = this.verifyRefreshToken(token);

    await this.tokenRepository.create({
      data: {
        token,
        userId,
        expiredAt: new Date(decodedRefreshToken.exp),
        type: TokenType.REFRESH,
      },
    });
  }
  async saveEmailVerificationToken(data: ICreateToken) {
    const { token, userId } = data;

    const decodedToken = this.verifyEmailVerificationToken(token);

    await this.tokenRepository.create({
      data: {
        token,
        userId,
        expiredAt: new Date(decodedToken.exp),
        type: TokenType.EMAIL_VERIFICATION,
      },
    });
  }

  async validateToken(token: string, tokenType: TokenType) {
    try {
      const existingToken = await this.tokenRepository.findOne({
        where: { token, type: tokenType },
      });

      if (!existingToken) throw new UnauthorizedException('Invalid token');
      if (existingToken?.isRevoked)
        throw new UnauthorizedException('Token has been revoked');
      if (existingToken?.isUsed)
        throw new UnauthorizedException('Token has been used');

      return {
        existingToken,
      };
    } catch (error) {
      throw new UnauthorizedException(error?.message);
    }
  }

  async revokeRefreshToken(token: string) {
    await this.tokenRepository.update({
      where: { token, type: TokenType.REFRESH },
      data: { isRevoked: true },
    });
  }
}
