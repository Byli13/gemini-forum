import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  create(createPostDto: CreatePostDto, user: User) {
    const post = this.postsRepository.create({
      ...createPostDto,
      author: user,
    });
    return this.postsRepository.save(post);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [items, total] = await this.postsRepository.findAndCount({
      relations: ['author', 'comments', 'reactions'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: string) {
    return this.postsRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author', 'reactions', 'reactions.user'],
    });
  }
}
