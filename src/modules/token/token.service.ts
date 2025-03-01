/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import {
  ISaveRefreshToken,
  JWTDecodedToken,
  JWTTokenPayload,
  TokenType,
} from './types/token.type';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
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

    await this.createRefreshToken({
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
  async createRefreshToken(data: ISaveRefreshToken) {
    const { token, userId } = data;

    const decodedRefreshToken = this.verifyToken(token, {
      secret: this.configService.get<string>('jwt.refresh.secret'),
    });

    await this.prismaService.token.create({
      data: {
        token,
        userId,
        expiredAt: new Date(decodedRefreshToken.exp),
        type: TokenType.REFRESH,
      },
    });
  }

  async validateToken({
    token,
    tokenType,
  }: {
    token: string;
    tokenType: TokenType;
  }) {
    try {
      const existingToken = await this.prismaService.token.findUnique({
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
    await this.prismaService.token.update({
      where: { token, type: TokenType.REFRESH },
      data: { isRevoked: true },
    });
  }
}
