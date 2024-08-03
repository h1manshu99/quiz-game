import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/authModule'; // Import your AuthModule
import { GameModule } from './game/gameModule';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://hemuchauhan31:S6DUM6Aw3sNE59EA@cluster0.birwrhh.mongodb.net/'),
    GameModule,
    AuthModule,
  ],
})
export class AppModule {}
