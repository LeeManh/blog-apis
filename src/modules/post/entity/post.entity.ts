import { Type } from 'class-transformer';
import { UserEntity } from 'src/modules/user/entity/user.entity';

export class PostEntity {
  id: number;
  title: string;
  content: string;
  authorId: number;
  thumbnail: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  @Type(() => UserEntity)
  author: UserEntity;

  // @Type(() => PostCategoryEntity)
  // categories: PostCategoryEntity[];

  // @Type(() => PostTagEntity)
  // tags: PostTagEntity[];

  constructor(partial: Partial<PostEntity>) {
    Object.assign(this, partial);
  }
}
