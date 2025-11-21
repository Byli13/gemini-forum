import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './follow.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existingFollow = await this.followsRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });

    if (existingFollow) {
      throw new BadRequestException('You are already following this user');
    }

    const follow = this.followsRepository.create({
      follower: { id: followerId },
      following: { id: followingId },
    });

    return this.followsRepository.save(follow);
  }

  async unfollow(followerId: string, followingId: string) {
    const follow = await this.followsRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });

    if (!follow) {
      throw new BadRequestException('You are not following this user');
    }

    return this.followsRepository.remove(follow);
  }

  async getFollowers(userId: string) {
    return this.followsRepository.find({
      where: { following: { id: userId } },
      relations: ['follower'],
    });
  }

  async getFollowing(userId: string) {
    return this.followsRepository.find({
      where: { follower: { id: userId } },
      relations: ['following'],
    });
  }

  async isFollowing(followerId: string, followingId: string) {
    const count = await this.followsRepository.count({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });
    return count > 0;
  }
}
