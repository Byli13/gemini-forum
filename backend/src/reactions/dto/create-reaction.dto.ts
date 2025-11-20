import { IsNotEmpty, IsString, IsUUID, IsEnum } from 'class-validator';

export class CreateReactionDto {
  @IsNotEmpty()
  @IsUUID()
  postId: string;

  @IsNotEmpty()
  @IsEnum(['LIKE', 'LOVE', 'SUPPORT'])
  type: string;
}
