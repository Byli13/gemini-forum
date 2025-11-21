import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createCommentDto: CreateCommentDto, user: User) {
    const post = await this.postsRepository.findOne({ where: { id: createCommentDto.postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      post,
      author: user,
    });
    const savedComment = await this.commentsRepository.save(comment);

    const mentions = this.extractMentions(savedComment.content);
    for (const username of mentions) {
      await this.notificationsService.createMentionNotification(
        user,
        username,
        NotificationType.MENTION_COMMENT,
        post,
        savedComment,
      );
    }

    return savedComment;
  }

  private extractMentions(content: string): string[] {
    const regex = /@(\w+)/g;
    const matches = content.match(regex);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.substring(1)))];
  }

  async findOne(id: string) {
    return this.commentsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, user: User) {
    const comment = await this.findOne(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = updateCommentDto.content;
    return this.commentsRepository.save(comment);
  }

  async remove(id: string, user: User) {
    const comment = await this.findOne(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isAuthor = comment.author.id === user.id;
    const isAdmin = user.isAdmin;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('You are not allowed to delete this comment');
    }

    await this.commentsRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }
}

