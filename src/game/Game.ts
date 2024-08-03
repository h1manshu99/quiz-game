import { Schema, Document } from 'mongoose';

export const QuestionSchema = new Schema({
  text: { type: String, required: true },
  choices: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

export interface Question extends Document {
  text: string;
  choices: string[];
  correctAnswer: string;
}

export interface GameSession extends Document {
    player1: string;
    player2: string;
    questions: Question[];
    currentQuestionIndexPlayer1: number;
    currentQuestionIndexPlayer2: number;
    scores: Map<string, number>;
    _id : string
  }
  
  export const GameSessionSchema = new Schema({
    player1: { type: String, required: true },
    player2: { type: String, required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    currentQuestionIndexPlayer1: { type: Number, default: 0 },
    currentQuestionIndexPlayer2: { type: Number, default: 0 },
    scores: { type: Map, of: Number, default: {} },
  });
