import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from './chat.gateway'; 

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private gateway: ChatGateway,       
  ) {}

  async createDirectConversation(currentUserId: string, otherUserId: string) {
    if (currentUserId === otherUserId) {
      throw new ForbiddenException('Cannot create a direct conversation with yourself');
    }
    const otherUser = await this.prisma.user.findUnique({
      where: { id: otherUserId },
    });
    if (!otherUser) {
      throw new NotFoundException('Other user not found');
    }
    const existing = await this.prisma.conversation.findFirst({
      where: {
        isGroup: false,
        participants: {
          every: {
            userId: { in: [currentUserId, otherUserId] },
          },
        },
      },
      include: {
        participants: { include: { user: true } },
      },
    });

    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: currentUserId },
            { userId: otherUserId },
          ],
        },
      },
      include: {
        participants: { include: { user: true } },
      },
    });
  }

  async createGroupConversation(currentUserId: string, name: string | undefined, participantIds: string[]) {
    const uniqueIds = Array.from(new Set([...participantIds, currentUserId]));

    return this.prisma.conversation.create({
      data: {
        isGroup: true,
        name,
        participants: {
          create: uniqueIds.map((id) => ({ userId: id })),
        },
      },
      include: {
        participants: { include: { user: true } },
      },
    });
  }

  async getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: { include: { user: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getConversationMessages(userId: string, conversationId: string) {
    await this.ensureParticipant(userId, conversationId);

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, username: true } },
      },
    });
  }

  async ensureParticipant(userId: string, conversationId: string) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!convo) throw new NotFoundException('Conversation not found');

    const isParticipant = convo.participants.some((p) => p.userId === userId);
    if (!isParticipant) throw new ForbiddenException('Not a participant');

    return convo;
  }

  async sendMessage(userId: string, conversationId: string, content: string) {
    await this.ensureParticipant(userId, conversationId);

    const message = await this.prisma.message.create({
      data: {
        senderId: userId,
        conversationId,
        content,
      },
      include: {
        sender: { select: { id: true, username: true } },
      },
    });

    const payload = {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      conversationId: message.conversationId,
      sender: {
        id: message.sender.id,
        username: message.sender.username,
      },
    };

    this.gateway.broadcastMessage(payload);

    return payload;
  }

  async editMessage(userId: string, messageId: string, content: string) {
    if (!content?.trim()) {
      throw new BadRequestException('Content cannot be empty');
    }

    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }
    await this.ensureParticipant(userId, message.conversationId);

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { content },
      include: {
        sender: { select: { id: true, username: true } },
      },
    });

    const payload = {
      id: updated.id,
      content: updated.content,
      createdAt: updated.createdAt,
      conversationId: updated.conversationId,
      sender: {
        id: updated.sender.id,
        username: updated.sender.username,
      },
    };

    this.gateway.broadcastEditMessage(payload); 

    return payload;
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }
    await this.ensureParticipant(userId, message.conversationId);

    await this.prisma.message.delete({
      where: { id: messageId },
    });

    this.gateway.broadcastDeleteMessage({
      id: messageId,
      conversationId: message.conversationId,
    });

    return { success: true };
  }

  async addUsersToGroup(currentUserId: string, convoId: string, participantIds: string[]) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: convoId },
      include: { participants: true },
    });

    if (!convo) throw new NotFoundException('Conversation not found');
    if (!convo.isGroup) throw new ForbiddenException('Cannot add users to a direct conversation');

    const isMember = convo.participants.some((p) => p.userId === currentUserId);
    if (!isMember) throw new ForbiddenException('You are not part of this conversation');

    const existingIds = new Set(convo.participants.map((p) => p.userId));
    const toAdd = participantIds.filter((id) => !existingIds.has(id));

    if (toAdd.length === 0) return convo;

    await this.prisma.conversationParticipant.createMany({
      data: toAdd.map((id) => ({
        userId: id,
        conversationId: convoId,
      })),
      skipDuplicates: true,
    });

    return this.prisma.conversation.findUnique({
      where: { id: convoId },
      include: { participants: { include: { user: true } } },
    });
  }

  async leaveGroup(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.isGroup) {
      throw new ForbiddenException('Cannot leave a direct conversation');
    }

    const isMember = conversation.participants.some((p) => p.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a participant of this conversation');
    }

    await this.prisma.conversationParticipant.deleteMany({
      where: {
        userId,
        conversationId,
      },
    });

    return { success: true };
  }

  async searchConversationsByName(userId: string, query: string) {
    const term = query?.trim();
    if (!term) return [];

    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
        name: {
          contains: term,
          mode: 'insensitive',
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
}
