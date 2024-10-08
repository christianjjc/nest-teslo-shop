import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';

enum WsEvents {
  CLIENTS_UPDATED = 'clients-updated',
  CLIENT_CONNECT = 'connect',
  CLIENT_DISCONNECT = 'disconnect',
  MESSAGE_FROM_CLIENT = 'message-from-client',
  MESSAGE_FROM_SERVER = 'message-from-server',
}

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  constructor(
    //
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new Logger('Messages-WsGateway');

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }
    console.log({ payload });

    // client.join('SALA_COMUNICADOS'); //! *** EMITE A SALA ESPECÍFICA ***

    this.logger.log({ Connected: `${this.messagesWsService.getConnectedClients()}` });
    this.wss.emit(WsEvents.CLIENTS_UPDATED, this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.logger.log({ Connected: `${this.messagesWsService.getConnectedClients()}` });
    this.wss.emit(WsEvents.CLIENTS_UPDATED, this.messagesWsService.getConnectedClients());
  }

  @SubscribeMessage(WsEvents.MESSAGE_FROM_CLIENT)
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    console.log({ id: client.id, payload });

    /* //! EMITE SOLO AL CLIENTE QUE ENVIÓ
    client.emit(WsEvents.MESSAGE_FROM_SERVER, {
      fullName: 'Soy Yo',
      "EMIT_message": payload.message || 'no message',
    }); */

    /* //! EMITE A TODOS, MENOS AL CLIENTE EMISOR
    client.broadcast.emit(WsEvents.MESSAGE_FROM_SERVER, {
      fullName: 'Soy Yo',
      BROADCAST_message: payload.message || 'no message',
    }); */

    //! EMITE A TODOS LOS CLIENTES
    this.wss.emit(WsEvents.MESSAGE_FROM_SERVER, {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no message',
    });

    /* //! *** EMITE A SALA ESPECÍFICA ***
    this.wss.to('SALA_COMUNICADOS').emit(WsEvents.MESSAGE_FROM_SERVER, {
      fullName: 'Soy Yo',
      ALL_USERS_message: payload.message || 'no message',
    }); */
  }
}
