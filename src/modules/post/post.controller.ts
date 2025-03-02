import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { USER_ROLES } from '../role/constant/role.constant';
import { CreatePostDto } from './dtos/create-post.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JWTDecodedToken } from '../token/types/token.type';
import { PostService } from './post.service';
import { Public } from 'src/common/decorators/public.decorator';
import { UpdatePostDto } from './dtos/update-post.dto';

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
  getPosts() {
    return this.postService.getPosts();
  }

  @Public()
  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postService.getPostById(+id);
  }

  @Put(':id')
  updatePost(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.updatePost(+id, updatePostDto);
  }

  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postService.deletePost(+id);
  }
}
