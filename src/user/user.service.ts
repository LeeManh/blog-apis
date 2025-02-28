import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { RoleService } from 'src/role/role.service';
import { ROLE_NAMES } from 'src/role/types/role.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'src/common/libs/hash.lib';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly roleService: RoleService,
    private readonly prismaService: PrismaService,
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, username } = createUserDto;

    const role = await this.roleService.getRoleByRoleName(ROLE_NAMES.USER);

    const user = await this.prismaService.user.create({
      data: {
        email,
        password: await hash(password),
        username,
        roleId: role.id,
      },
    });

    return user;
  }
}
