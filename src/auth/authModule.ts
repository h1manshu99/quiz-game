import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './authService';
import { AuthController } from './authController';
import { JwtStrategy } from './jwtStrategy';
import { UserSchema } from './User';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        // Import MongooseModule to connect to MongoDB and define User schema
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),

        // Import ConfigModule to use environment variables
        ConfigModule.forRoot(),

        // Configure JwtModule for JWT authentication
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('quiz_game') || 'default_secret',
                signOptions: { expiresIn: '60m' }, // Token expiration time
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
