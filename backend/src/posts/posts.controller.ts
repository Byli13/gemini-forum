import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }
}
