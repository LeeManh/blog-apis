import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { RoleService } from 'src/modules/role/role.service';
import { compare, hash } from 'src/common/libs/hash.lib';
import { UserRepository } from './user.repository';
import { USER_ROLES } from '../role/constant/role.constant';

@Injectable()
export class UserService {
  constructor(
    private readonly roleService: RoleService,
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, username } = createUserDto;

    // validate email uniqueness
    const existUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existUser) throw new ConflictException('Email already registered');

    // get user role
    const userRole = await this.roleService.getRoleById(USER_ROLES.USER);

    // create user
    const user = await this.userRepository.create({
      data: {
        email,
        password: await hash(password),
        username,
        roleId: userRole.id,
      },
    });

    return user;
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserById(id: number) {
    return this.userRepository.findOneOrThrow(
      { where: { id } },
      `User with id ${id} not found`,
    );
  }

  async validateUser(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatchPassword = await compare(password, user.password);
    if (!isMatchPassword)
      throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async getPermissionsByUserId(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      include: {
        role: {
          include: { rolePermissions: { include: { permission: true } } },
        },
      },
    });

    return user.role.rolePermissions?.map((rp) => rp.permission);
  }
}
