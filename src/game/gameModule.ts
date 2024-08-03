import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './gameController';
import { GameService } from './gameService';
import { GameGateway } from './gameGateway';
import { GameSessionSchema, QuestionSchema } from './Game';
import { AuthModule } from '../auth/authModule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: 'GameSession', schema: GameSessionSchema },
      { name: 'Question', schema: QuestionSchema },
    ]),

     // Import ConfigModule to use environment variables
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET') || 'default_secret',
          signOptions: { expiresIn: '60m' },
        }),
      }),
    ],
  
  controllers: [GameController],
  providers: [GameService, GameGateway],
})
export class GameModule {}
