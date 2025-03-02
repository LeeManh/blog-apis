import { Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dtos/create-post.dto';
import { JWTDecodedToken } from '../token/types/token.type';
import { PostEntity } from './entity/post.entity';
import { UpdatePostDto } from './dtos/update-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

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

  async getPosts() {
    const posts = await this.postRepository.findMany({
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

    return posts.map(
      (post) =>
        new PostEntity({
          ...post,
          tags: post?.tags?.map((tag) => tag.tag),
          categories: post?.categories?.map((category) => category.category),
        } as unknown as PostEntity),
    );
  }

  async getPostById(postId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
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

    return new PostEntity({
      ...post,
      tags: post?.tags?.map((tag) => tag.tag),
      categories: post?.categories?.map((category) => category.category),
    } as unknown as PostEntity);
  }

  async updatePost(postId: number, updatePostDto: UpdatePostDto) {
    const { tags = [], categories = [] } = updatePostDto;

    await this.postRepository.findOneOrThrow({
      where: { id: postId },
    });

    const updatedPost = await this.postRepository.update({
      where: { id: postId },
      data: {
        ...updatePostDto,
        tags: {
          deleteMany: {},
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
          deleteMany: {},
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
