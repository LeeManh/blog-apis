import { Injectable } from '@nestjs/common';
import { JwtTokenService } from 'src/common/services/jwt-token.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UserService } from '../user/user.service';
import { JWTTokenPayload } from 'src/common/types/jwt.type';
import { LoginUserDto } from './dtos/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly userService: UserService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    await this.userService.createUser(registerUserDto);

    return {
      message: 'User registered successfully',
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userService.validateUser(email, password);

    /* --------------------- Generate and create JWT tokens --------------------- */
    const jwtTokenPayload: JWTTokenPayload = {
      userId: user.id,
      roleId: user.roleId,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtTokenService.generateAccessToken(jwtTokenPayload),
      this.jwtTokenService.generateRefreshToken(jwtTokenPayload),
    ]);
    await this.jwtTokenService.createRefreshToken({
      token: refreshToken,
      userId: user.id,
    });

    return { accessToken, refreshToken };
  }
}
