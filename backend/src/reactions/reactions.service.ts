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
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async toggle(createReactionDto: CreateReactionDto, user: User) {
    const post = await this.postsRepository.findOne({ 
      where: { id: createReactionDto.postId },
      relations: ['author']
    });
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
        // Removing reaction -> decrease reputation
        await this.reactionsRepository.remove(existingReaction);
        await this.updateReputation(post.author.id, -1);
      } else {
        // Changing reaction -> no net change in reputation count (assuming all reactions worth 1)
        await this.reactionsRepository.update(existingReaction.id, { type: createReactionDto.type });
      }
    } else {
      // New reaction -> increase reputation
      const reaction = this.reactionsRepository.create({
        type: createReactionDto.type,
        post,
        user,
      });
      await this.reactionsRepository.save(reaction);
      await this.updateReputation(post.author.id, 1);
    }

    return this.postsRepository.findOne({
      where: { id: post.id },
      relations: ['author', 'comments', 'comments.author', 'reactions', 'reactions.user'],
    });
  }

  private async updateReputation(userId: string, amount: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (user) {
      user.reputation = (user.reputation || 0) + amount;
      await this.usersRepository.save(user);
    }
  }
}
