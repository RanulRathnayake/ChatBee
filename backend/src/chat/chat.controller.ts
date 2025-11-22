import { Body, Controller, Get, Param, Post, UseGuards, Request, Query, Patch, Delete, } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateDirectConversationDto } from './dto/create-direct-conversation.dto';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto';
import { AddGroupParticipantsDto } from './dto/add-group-participants.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chat: ChatService) {}

  @Get('conversations')
  async myConversations(@Request() req) {
    return this.chat.getUserConversations(req.user.userId);
  }

  @Post('conversations/direct')
  async createDirectConversation(
    @Request() req,
    @Body() dto: CreateDirectConversationDto,
  ) {
    return this.chat.createDirectConversation(req.user.userId, dto.otherUserId);
  }

  @Post('conversations/group')
  async createGroupConversation(
    @Request() req,
    @Body() dto: CreateGroupConversationDto,
  ) {
    return this.chat.createGroupConversation(
      req.user.userId,
      dto.name,
      dto.participantIds,
    );
  }

  @Get('conversations/:id/messages')
  async getMessages(@Request() req, @Param('id') id: string) {
    return this.chat.getConversationMessages(req.user.userId, id);
  }

  @Post('messages')
  async sendMessage(@Request() req, @Body() dto: SendMessageDto) {
    return this.chat.sendMessage(req.user.userId, dto.conversationId, dto.content);
  }

  @Patch('messages/:id')
  async editMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.chat.editMessage(req.user.userId, id, dto.content);
  }

  @Delete('messages/:id')
  async deleteMessage(
    @Request() req,
    @Param('id') id: string,
  ) {
    return this.chat.deleteMessage(req.user.userId, id);
  }

  @Post('conversations/:id/participants')
  async addParticipants(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddGroupParticipantsDto,
  ) {
    return this.chat.addUsersToGroup(req.user.userId, id, dto.participantIds);
  }

  @Post('conversations/:id/leave')
  async leaveGroup(
    @Request() req,
    @Param('id') id: string,
  ) {
    return this.chat.leaveGroup(req.user.userId, id);
  }

  @Get('conversations/search')
  async searchConversations(
    @Request() req,
    @Query('q') q: string,   
  ) {
    return this.chat.searchConversationsByName(req.user.userId, q);
  }
}
