import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './gameService';
import { Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway()
export class GameGateway {
    @WebSocketServer()
    server!: Server;

    constructor(@Inject(forwardRef(() => GameService)) private readonly gameService: GameService) { }

    private connectedClients = new Map<string, Socket>();

    @SubscribeMessage('connect')
    handleConnection(@ConnectedSocket() client: Socket) {
        console.log('Client connected:', client.id)
    }

    @SubscribeMessage('register')
    handleRegister(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
        console.log('Registering client:', client.id, 'with user ID:', data.userId);
        this.connectedClients.set(data.userId, client);
    }

    connectPlayersToRoom(playerIds: string[], roomId: string) {
        playerIds.forEach(playerId => {
            const client = this.connectedClients.get(playerId);
            if (client) {
                client.join(roomId);
                console.log(`Player ${playerId} joined room ${roomId}`);
            } else {
                console.log(`Player ${playerId} not connected`);
            }
        });
    }

    // Emit to all clients in a room
    emitToRoom(roomId: string, event: string, data: any) {
        this.server.to(roomId).emit(event, data);
    }

    emitToPlayers(playerIds: string[], event: string, data: any) {
        playerIds.forEach(playerId => {
            const client = this.connectedClients.get(playerId);
            if (client) {
                this.server.to(client.id).emit(event, data);
            }
        });
    }

    @SubscribeMessage('disconnect')
    handleDisconnect(@ConnectedSocket() client: Socket) {
        console.log('Client disconnected:', client.id);
        this.connectedClients.delete(client.id);
    }

    public emitToPlayer(playerId: string, event: string, data: any) {
        const client = this.connectedClients.get(playerId);
        if (client) {
            this.server.to(client.id).emit(event, data);
        }
    }

    @SubscribeMessage('game:init')
    async handleGameInit(@MessageBody() data: { sessionId: string, playerId: string }) {
        const session = await this.gameService.getGameSession(data.sessionId);
        if (session) {
            this.emitToRoom(data.sessionId, 'game:init', session);
        } else {
            this.emitToPlayer(data.playerId, 'error', { message: 'Game session not found' });
        }
    }

    @SubscribeMessage('question:send')
    async handleQuestionRequest(@MessageBody() data: { sessionId: string, playerId: string }) {
        const question = await this.gameService.getNextQuestion(data.sessionId, data.playerId);
        if (question) {
            this.emitToPlayer(data.playerId, 'question:send', question);
        } else {
            this.emitToPlayer(data.playerId, 'error', { message: 'Failed to get the next question' });
        }
    }

    @SubscribeMessage('answer:submit')
    async handleAnswerSubmit(@MessageBody() data: { sessionId: string, playerId: string, answer: string }) {
        const result = await this.gameService.submitAnswer(data.sessionId, data.playerId, data.answer);

        if (result.isGameOver) {
            const player1Score = result.session.scores.get(result.session.player1) ?? 0;
            const player2Score = result.session.scores.get(result.session.player2) ?? 0;

            const winner = player1Score > player2Score
                ? result.session.player1
                : result.session.player2;


            this.emitToPlayers([result.session.player1, result.session.player2], 'game:end', {
                winner,
                scores: result.session.scores,
            });
        } else {
            // Notify the player about the result of their answer and continue the game
            this.emitToPlayer(data.playerId, 'answer:submit', {
                isGameOver: false,
                scores: result.session.scores,
            });
        }
    }

}
