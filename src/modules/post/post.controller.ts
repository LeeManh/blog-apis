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
import { Roles } from 'src/common/decorators/roles.decorator';
import { USER_ROLES } from '../role/constant/role.constant';
import { CreatePostDto } from './dtos/create-post.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JWTDecodedToken } from '../token/types/token.type';
import { PostService } from './post.service';
import { Public } from 'src/common/decorators/public.decorator';
import { UpdatePostDto } from './dtos/update-post.dto';
import { GetPostsQueryDto } from './dtos/get-posts.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Roles(USER_ROLES.ADMIN)
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

  @Roles(USER_ROLES.ADMIN)
  @Patch(':id')
  updatePost(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.updatePost(+id, updatePostDto);
  }

  @Roles(USER_ROLES.ADMIN)
  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postService.deletePost(+id);
  }
}
