import { ArrayNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';

export class CreateGroupConversationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsArray()
  @ArrayNotEmpty()
  participantIds: string[]; 
}
