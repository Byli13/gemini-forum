import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createMentionNotification(
    sender: User,
    recipientUsername: string,
    type: NotificationType,
    post?: Post,
    comment?: Comment,
  ) {
    if (sender.username === recipientUsername) return; // Don't notify self

    const recipient = await this.usersRepository.findOne({ where: { username: recipientUsername } });
    if (!recipient) return;

    const notification = this.notificationsRepository.create({
      sender,
      recipient,
      type,
      post,
      comment,
    });

    return this.notificationsRepository.save(notification);
  }

  async findAllForUser(user: User) {
    return this.notificationsRepository.find({
      where: { recipient: { id: user.id } },
      relations: ['sender', 'post', 'comment'],
      order: { createdAt: 'DESC' },
      take: 50, // Limit to last 50 notifications
    });
  }

  async markAsRead(id: string, user: User) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, recipient: { id: user.id } },
    });
    if (notification) {
      notification.isRead = true;
      await this.notificationsRepository.save(notification);
    }
  }

  async getUnreadCount(user: User) {
    return this.notificationsRepository.count({
      where: { recipient: { id: user.id }, isRead: false },
    });
  }
}
