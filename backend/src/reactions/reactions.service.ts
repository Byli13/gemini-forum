import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './entities/reaction.entity';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private reactionsRepository: Repository<Reaction>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async toggle(createReactionDto: CreateReactionDto, user: User) {
    const post = await this.postsRepository.findOne({ where: { id: createReactionDto.postId } });
    if (!post) {
      throw new Error('Post not found');
    }

    const existingReaction = await this.reactionsRepository.findOne({
      where: {
        post: { id: post.id },
        user: { id: user.id },
      },
    });

    if (existingReaction) {
      if (existingReaction.type === createReactionDto.type) {
        return this.reactionsRepository.remove(existingReaction);
      } else {
        await this.reactionsRepository.update(existingReaction.id, { type: createReactionDto.type });
        return this.reactionsRepository.findOne({ where: { id: existingReaction.id } });
      }
    }

    const reaction = this.reactionsRepository.create({
      type: createReactionDto.type,
      post,
      user,
    });
    return this.reactionsRepository.save(reaction);
  }
}
