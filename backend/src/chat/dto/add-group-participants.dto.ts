import { ArrayNotEmpty, IsArray } from 'class-validator';

export class AddGroupParticipantsDto {
  @IsArray()
  @ArrayNotEmpty()
  participantIds: string[];
}
