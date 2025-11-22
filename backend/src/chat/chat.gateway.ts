import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', 
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private jwt: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token || typeof token !== 'string') {
        client.disconnect(true);
        return;
      }
      const payload = this.jwt.verify(token);
      (client as any).userId = payload.sub;
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
  }

  @SubscribeMessage('joinConversation')
  async onJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = (client as any).userId;
    await this.chatService.ensureParticipant(userId, data.conversationId);
    client.join(data.conversationId);
  }

  @SubscribeMessage('sendMessage')
  async onSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const userId = (client as any).userId;
    const message = await this.chatService.sendMessage(
      userId,
      data.conversationId,
      data.content,
    );
    
    this.server.to(data.conversationId).emit('newMessage', message);
    return message;
  }
}
