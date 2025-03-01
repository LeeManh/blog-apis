import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../token/token.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { TokenType } from '../token/types/token.type';
import { capitalizeFirst } from 'src/common/libs/string.lib';
import { User } from '@prisma/client';
import { LogoutDto } from './dtos/logout.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    try {
      const user = await this.userService.createUser(registerUserDto);

      /* --------------------- Generate and create JWT tokens --------------------- */
      const { accessToken, refreshToken } =
        await this.tokenService.generateAndStoreTokens({
          userId: user.id,
          roleId: user.roleId,
        });

      /* --------------------- Send email verification token ---------------- */
      const emailVerificationToken =
        this.tokenService.generateEmailVerificationToken({
          userId: user.id,
          roleId: user.roleId,
        });
      await Promise.all([
        this.mailService.sendEmailVerification({
          username: user.username,
          email: user.email,
          emailVerificationToken,
        }),
        this.tokenService.saveEmailVerificationToken({
          token: emailVerificationToken,
          userId: user.id,
        }),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException(capitalizeFirst(error?.message));
    }
  }

  async login(user: User) {
    try {
      /* --------------------- Generate and create JWT tokens --------------------- */
      const { accessToken, refreshToken } =
        await this.tokenService.generateAndStoreTokens({
          userId: user.id,
          roleId: user.roleId,
        });
      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnauthorizedException(capitalizeFirst(error?.message));
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { token } = refreshTokenDto;

      /* --------------------- Validate refresh token --------------------- */
      const decodedToken = this.tokenService.verifyRefreshToken(token);
      await this.tokenService.validateToken(token, TokenType.REFRESH);

      /* --------------------- Generate and create JWT tokens --------------------- */
      const { accessToken, refreshToken } =
        await this.tokenService.generateAndStoreTokens({
          userId: decodedToken.userId,
          roleId: decodedToken.roleId,
        });

      /* --------------------- Revoke old refresh token ---------------- */
      await this.tokenService.revokeRefreshToken(token);

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnauthorizedException(capitalizeFirst(error?.message));
    }
  }

  async logout(logoutDto: LogoutDto) {
    try {
      await this.tokenService.validateToken(logoutDto.token, TokenType.REFRESH);
      // await this.tokenService.revokeRefreshToken(logoutDto.token);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnauthorizedException(capitalizeFirst(error?.message));
    }
  }

  async forgotPassword() {}
}
