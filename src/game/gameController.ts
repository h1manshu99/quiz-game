import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/authGuard';
import { GameService } from './gameService';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtAuthGuard)
  @Post('start')
  async startGame(@Body('player1Id') player1Id: string, @Body('player2Id') player2Id: string) {
    return this.gameService.startNewGameSession(player1Id, player2Id);
  }
}
