// jwtAuthGuard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {


        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('No token found');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            request.user = payload; // Add payload to request object
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    private extractTokenFromHeader(request: Request): string | null {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7); // Remove 'Bearer ' prefix
        }
        return null;
    }
}
