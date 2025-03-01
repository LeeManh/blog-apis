import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ISaveRefreshToken,
  JWTDecodedToken,
  JWTTokenPayload,
} from '../types/jwt.type';
import { JWTTokenRepository } from '../repository/jwt-token.repository';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly jwtTokenRepository: JWTTokenRepository,
  ) {}

  generateAccessToken(payload: JWTTokenPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.access.secret'),
      expiresIn: this.configService.get<string>('jwt.access.expiresIn'),
    });
  }

  generateRefreshToken(payload: JWTTokenPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refresh.secret'),
      expiresIn: this.configService.get<string>('jwt.refresh.expiresIn'),
    });
  }

  verifyAccessToken(token: string): JWTDecodedToken {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('jwt.access.secret'),
    });
  }

  verifyRefreshToken(token: string): JWTDecodedToken {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('jwt.refresh.secret'),
    });
  }

  createRefreshToken(data: ISaveRefreshToken) {
    const { token, userId } = data;

    const decodedRefreshToken = this.verifyRefreshToken(token);

    return this.jwtTokenRepository.create({
      data: { token, userId, expiredAt: new Date(decodedRefreshToken.exp) },
    });
  }
}
