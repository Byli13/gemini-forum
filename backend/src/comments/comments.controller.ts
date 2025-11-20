import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(createCommentDto, req.user);
  }
}
