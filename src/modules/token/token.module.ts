import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenRepository } from './token.repository';

@Module({
  imports: [JwtModule],
  providers: [TokenService, TokenRepository],
  exports: [TokenService],
})
export class TokenModule {}
