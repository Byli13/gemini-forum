import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum NotificationType {
  MENTION_POST = 'MENTION_POST',
  MENTION_COMMENT = 'MENTION_COMMENT',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  recipient: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  sender: User;

  @ManyToOne(() => Post, { nullable: true, onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  comment: Comment;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
