import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':userId')
  follow(@Request() req, @Param('userId') followingId: string) {
    return this.followsService.follow(req.user.userId, followingId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  unfollow(@Request() req, @Param('userId') followingId: string) {
    return this.followsService.unfollow(req.user.userId, followingId);
  }

  @Get(':userId/followers')
  getFollowers(@Param('userId') userId: string) {
    return this.followsService.getFollowers(userId);
  }

  @Get(':userId/following')
  getFollowing(@Param('userId') userId: string) {
    return this.followsService.getFollowing(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/check')
  isFollowing(@Request() req, @Param('userId') followingId: string) {
    return this.followsService.isFollowing(req.user.userId, followingId);
  }
}
