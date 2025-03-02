import { UserStatus } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  username: string;
  email: string;
  roleId: number;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
