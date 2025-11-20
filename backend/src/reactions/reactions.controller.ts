import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  toggle(@Body() createReactionDto: CreateReactionDto, @Request() req) {
    return this.reactionsService.toggle(createReactionDto, req.user);
  }
}
