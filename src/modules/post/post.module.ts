import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostRepository } from './post.repository';
import { TagRepository } from '../tag/tag.repository';

@Module({
  controllers: [PostController],
  providers: [PostService, PostRepository, TagRepository],
  exports: [PostService],
})
export class PostModule {}
