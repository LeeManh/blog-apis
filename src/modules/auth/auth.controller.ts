import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from '@prisma/client';
import { Public } from 'src/common/decorators/public.decorator';
import { LogoutDto } from './dtos/logout.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { USER_ROLES } from '../role/constant/role.constant';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Request() req: any) {
    return this.authService.login(req.user as User);
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto);
  }

  @Roles(USER_ROLES.ADMIN)
  @Get('me')
  async me(@Request() req: any) {
    console.log(req.user);

    return 'me';
  }
}
