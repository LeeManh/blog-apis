import { Global, Module } from '@nestjs/common';
import { JwtTokenService } from './services/jwt-token.service';
import { JwtModule } from '@nestjs/jwt';
import { JWTTokenRepository } from './repository/jwt-token.repository';
import { PrismaClient } from '@prisma/client';

@Global()
@Module({
  imports: [JwtModule],
  providers: [JwtTokenService, JWTTokenRepository, PrismaClient],
  exports: [JwtTokenService],
})
export class CommonModule {}
