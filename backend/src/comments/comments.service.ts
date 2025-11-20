import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(createCommentDto: CreateCommentDto, user: User) {
    const post = await this.postsRepository.findOne({ where: { id: createCommentDto.postId } });
    if (!post) {
      throw new Error('Post not found');
    }

    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      post,
      author: user,
    });
    return this.commentsRepository.save(comment);
  }
}
