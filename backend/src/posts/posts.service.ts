import { Injectable, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../users/entities/user.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Reaction } from '../reactions/entities/reaction.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class PostsService implements OnModuleInit {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Reaction)
    private reactionsRepository: Repository<Reaction>,
    private notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    // Fix orphaned posts (posts with no author)
    const orphanedPosts = await this.postsRepository.find({
      where: { author: IsNull() },
      relations: ['author'],
    });

    if (orphanedPosts.length > 0) {
      console.log(`Found ${orphanedPosts.length} orphaned posts. Attempting to reassign...`);
      
      // Find a user to assign them to (e.g., the first admin or just the first user)
      const adoptionUser = await this.usersRepository.findOne({
        where: {},
        order: { createdAt: 'ASC' } // Oldest user (likely the creator)
      });

      if (adoptionUser) {
        for (const post of orphanedPosts) {
          post.author = adoptionUser;
          await this.postsRepository.save(post);
          console.log(`Reassigned post "${post.title}" to user ${adoptionUser.username}`);
        }
      } else {
        console.warn('No users found to adopt orphaned posts.');
      }
    }
  }

  async create(createPostDto: CreatePostDto, user: User) {
    const post = this.postsRepository.create({
      ...createPostDto,
      author: user,
    });
    const savedPost = await this.postsRepository.save(post);

    const mentions = this.extractMentions(savedPost.content);
    for (const username of mentions) {
      await this.notificationsService.createMentionNotification(
        user,
        username,
        NotificationType.MENTION_POST,
        savedPost,
      );
    }

    return savedPost;
  }

  private extractMentions(content: string): string[] {
    const regex = /@(\w+)/g;
    const matches = content.match(regex);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.substring(1)))];
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, category?: string) {
    const qb = this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .loadRelationCountAndMap('post.commentsCount', 'post.comments')
      .loadRelationCountAndMap('post.reactionsCount', 'post.reactions')
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('(post.title ILIKE :search OR post.content ILIKE :search)', { search: `%${search}%` });
    }

    if (category && category !== 'All') {
      qb.andWhere('post.category = :category', { category });
    }

    const [items, total] = await qb.getManyAndCount();
    
    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: string) {
    return this.postsRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author', 'reactions', 'reactions.user'],
    });
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: User) {
    const post = await this.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    
    if (post.author.id !== user.id) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    Object.assign(post, updatePostDto);
    return this.postsRepository.save(post);
  }

  async remove(id: string, user: User) {
    const post = await this.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const isAuthor = post.author.id === user.id;
    const isAdmin = user.isAdmin;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    // Manually delete related entities to ensure cascade works even if DB constraints fail
    await this.commentsRepository.delete({ post: { id: post.id } });
    await this.reactionsRepository.delete({ post: { id: post.id } });

    await this.postsRepository.remove(post);

    if (isAdmin && !isAuthor) {
      return { message: 'Topic deleted by admin' };
    } else {
      return { message: 'Topic deleted successfully' };
    }
  }
}

