import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { Reaction } from './entities/reaction.entity';
import { Post } from '../posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction, Post])],
  controllers: [ReactionsController],
  providers: [ReactionsService],
})
export class ReactionsModule {}
