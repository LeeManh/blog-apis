import { Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dtos/create-post.dto';
import { JWTDecodedToken } from '../token/types/token.type';
import { PostEntity } from './entity/post.entity';
import { UpdatePostDto } from './dtos/update-post.dto';
import { PostStatus } from '@prisma/client';
import { GetPostsQueryDto } from './dtos/get-posts.dto';
import { USER_ROLES } from '../role/constant/role.constant';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  private formatPost(post: any): PostEntity {
    return new PostEntity({
      ...post,
      tags: post?.tags?.map((tag) => tag.tag) || [],
      categories: post?.categories?.map((category) => category.category) || [],
    } as unknown as PostEntity);
  }

  private getStatusBaseRole(user?: JWTDecodedToken) {
    return user?.roleId === USER_ROLES.ADMIN ? undefined : PostStatus.PUBLISHED;
  }

  async createPost(createPostDto: CreatePostDto, user: JWTDecodedToken) {
    const {
      content,
      title,
      tags = [],
      categories = [],
      thumbnail,
    } = createPostDto;

    return this.postRepository.create({
      data: {
        title,
        content,
        thumbnail,
        author: { connect: { id: user.userId } },
        tags: {
          create: tags.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: { name: tag },
                create: { name: tag },
              },
            },
          })),
        },
        categories: {
          create: categories.map((category) => ({
            category: {
              connectOrCreate: {
                where: { name: category },
                create: { name: category },
              },
            },
          })),
        },
      },
    });
  }

  async getPosts(query: GetPostsQueryDto, user?: JWTDecodedToken) {
    const posts = await this.postRepository.findMany({
      where: { status: this.getStatusBaseRole(user) },
      include: {
        author: true,
        tags: {
          select: {
            tag: true,
          },
        },
        categories: {
          select: {
            category: true,
          },
        },
      },
    });

    return posts.map((post) => new PostEntity(this.formatPost(post)));
  }

  async getPostById(postId: number, user?: JWTDecodedToken) {
    const post = await this.postRepository.findOneOrThrow({
      where: { id: postId, status: this.getStatusBaseRole(user) },
      include: {
        author: true,
        tags: {
          select: {
            tag: true,
          },
        },
        categories: {
          select: {
            category: true,
          },
        },
      },
    });

    return new PostEntity(this.formatPost(post));
  }

  async updatePost(postId: number, updatePostDto: UpdatePostDto) {
    const { tags, categories, ...restUpdate } = updatePostDto;

    await this.postRepository.findOneOrThrow({
      where: { id: postId },
    });

    const data: any = {
      ...restUpdate,
    };

    if (tags) {
      data.tags = {
        deleteMany: {},
        create: tags.map((tag) => ({
          tag: {
            connectOrCreate: {
              where: { name: tag },
              create: { name: tag },
            },
          },
        })),
      };
    }

    if (categories) {
      data.categories = {
        deleteMany: {},
        create: categories.map((category) => ({
          category: {
            connectOrCreate: {
              where: { name: category },
              create: { name: category },
            },
          },
        })),
      };
    }

    const updatedPost = await this.postRepository.update({
      where: { id: postId },
      data,
    });

    return new PostEntity(updatedPost as unknown as PostEntity);
  }

  async deletePost(postId: number) {
    await this.postRepository.findOneOrThrow({
      where: { id: postId },
    });

    await this.postRepository.update({
      where: { id: postId },
      data: {
        tags: {
          deleteMany: {},
        },
        categories: {
          deleteMany: {},
        },
      },
    });

    return this.postRepository.delete({
      where: { id: postId },
    });
  }
}
