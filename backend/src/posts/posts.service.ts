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

  findAll() {
    return this.postsRepository.find({
      relations: ['author', 'comments', 'reactions'],
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: string) {
    return this.postsRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author', 'reactions', 'reactions.user'],
    });
  }
}
