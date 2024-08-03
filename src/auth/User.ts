import { Schema, Document } from 'mongoose';

export const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export interface User extends Document {
  username: string;
  password: string;
}
