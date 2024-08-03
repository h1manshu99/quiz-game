import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './User';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private userModel: Model<User>,
        private jwtService: JwtService
    ) { }

    async register(username: string, password: string): Promise<any> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new this.userModel({ username, password: hashedPassword });
        return newUser.save();
    }

    async login(username: string, password: string): Promise<any> {
        const user = await this.userModel.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            const payload = { username: user.username, sub: user._id };
            return {
                access_token: this.jwtService.sign(payload),
            };
        }
        throw new Error('Invalid credentials');
    }
}
