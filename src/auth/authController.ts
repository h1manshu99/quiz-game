import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './authService';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: { username: string, password: string }) {
    return this.authService.register(registerDto.username, registerDto.password);
  }

  @Post('login')
  async login(@Body() loginDto: { username: string, password: string }) {
    return this.authService.login(loginDto.username, loginDto.password);
  }
}
