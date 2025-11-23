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
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwt: JwtService) {} 

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token || typeof token !== 'string') {
        client.disconnect(true);
        return;
      }

      const payload = this.jwt.verify(token);
      (client as any).userId = payload.sub;
      console.log('Client connected:', payload.sub);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', (client as any).userId);
  }

  @SubscribeMessage('joinConversation')
  onJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(data.conversationId);
  }

  broadcastMessage(message: any) {
    this.server.to(message.conversationId).emit('message', message);
  }

  broadcastEditMessage(message: any) {
    this.server.to(message.conversationId).emit('editMessage', message);
  }

  broadcastDeleteMessage(payload: { id: string; conversationId: string }) {
    this.server.to(payload.conversationId).emit('deleteMessage', payload);
  }
}
