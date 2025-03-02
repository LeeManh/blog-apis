import { IsOptional, IsEnum } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class GetPostsQueryDto {
  @IsOptional()
  @IsEnum(PostStatus, { message: 'Invalid status' })
  status?: PostStatus;

  // @IsOptional()
  // @Type(() => Number)
  // @IsInt({ message: 'Page must be an integer' })
  // @Min(1, { message: 'Page must be greater than or equal to 1' })
  // page?: number;

  // @IsOptional()
  // @Type(() => Number)
  // @IsInt({ message: 'Limit must be an integer' })
  // @Min(1, { message: 'Limit must be greater than or equal to 1' })
  // limit?: number;
}
