import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePostDto } from './dtos/create-post.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JWTDecodedToken } from '../token/types/token.type';
import { PostService } from './post.service';
import { Public } from 'src/common/decorators/public.decorator';
import { UpdatePostDto } from './dtos/update-post.dto';
import { GetPostsQueryDto } from './dtos/get-posts.dto';
import { Permissions } from '../auth/decorators/permission.decorator';
import { PERMISSIONS } from '../auth/constants/permissions.constant';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Permissions(PERMISSIONS.POST.CREATE)
  @Post()
  createPost(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: JWTDecodedToken,
  ) {
    return this.postService.createPost(createPostDto, user);
  }

  @Public()
  @Get()
  getPosts(
    @Query() query: GetPostsQueryDto,
    @CurrentUser() user?: JWTDecodedToken,
  ) {
    return this.postService.getPosts(query, user);
  }

  @Public()
  @Get(':id')
  getPost(@Param('id') id: string, @CurrentUser() user?: JWTDecodedToken) {
    return this.postService.getPostById(+id, user);
  }

  @Permissions(PERMISSIONS.POST.UPDATE)
  @Patch(':id')
  updatePost(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.updatePost(+id, updatePostDto);
  }

  @Permissions(PERMISSIONS.POST.DELETE)
  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postService.deletePost(+id);
  }
}
