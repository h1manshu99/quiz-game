import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameSession, Question } from './Game';
import { GameGateway } from './gameGateway';

@Injectable()
export class GameService {
    constructor(
        @InjectModel('GameSession') private gameSessionModel: Model<GameSession>,
        @InjectModel('Question') private questionModel: Model<Question>,
        private readonly socketGateway: GameGateway
    ) { }

    async startNewGameSession(player1Id: string, player2Id: string): Promise<GameSession> {
        const questions = await this.questionModel.find().limit(10).exec();
        const newSession = new this.gameSessionModel({
            player1: player1Id,
            player2: player2Id,
            questions: questions,
            currentQuestionIndexPlayer1: 0,
            currentQuestionIndexPlayer2: 0,
            scores: {
                [player1Id]: 0,
                [player2Id]: 0,
            },
        });
        const savedSession = await newSession.save();

        // Connect players to the game room
        this.socketGateway.connectPlayersToRoom([player1Id, player2Id], savedSession._id.toString());

        // Notify both players about the game start
        this.socketGateway.emitToPlayers([player1Id, player2Id], 'game:init', savedSession);

        return savedSession;
    }

    async getNextQuestion(sessionId: string, playerId: string): Promise<Question | null> {
        // populate the questions array to get the actual Question documents
        const session = await this.gameSessionModel
            .findById(sessionId)
            .populate('questions')
            .exec();

        if (!session) {
            throw new Error('Game session not found');
        }

        // Determine the current question index for the requesting player
        let currentQuestionIndex: number;
        if (playerId === (session as GameSession).player1) {
            currentQuestionIndex = (session as GameSession).currentQuestionIndexPlayer1 || 0;
        } else if (playerId === (session as GameSession).player2) {
            currentQuestionIndex = (session as GameSession).currentQuestionIndexPlayer2 || 0;
        } else {
            throw new Error('Player not found in this session');
        }

        // Check if there are more questions available
        if (currentQuestionIndex >= session.questions.length) {
            throw new Error('No more questions available');
        }

        // Safely access the next question
        const nextQuestion = session.questions[currentQuestionIndex] as Question;

        // Update the currentQuestionIndex for the requesting player
        if (playerId === (session as GameSession).player1) {
            (session as GameSession).currentQuestionIndexPlayer1 = currentQuestionIndex + 1;
        } else if (playerId === (session as GameSession).player2) {
            (session as GameSession).currentQuestionIndexPlayer2 = currentQuestionIndex + 1;
        }

        // Save the updated session
        await session.save();

        return nextQuestion;
    }


    async getGameSession(sessionId: string): Promise<GameSession | null> {
        return this.gameSessionModel.findById(sessionId).exec();
    }

    async submitAnswer(sessionId: string, playerId: string, answer: string) {
        const session = await this.gameSessionModel
            .findById(sessionId)
            .populate('questions')
            .exec();

        if (!session) {
            throw new Error('Game session not found');
        }

        // Determine the current question index for the requesting player
        let currentQuestionIndex: number;
        if (playerId === (session as GameSession).player1) {
            currentQuestionIndex = (session as GameSession).currentQuestionIndexPlayer1 || 0;
        } else if (playerId === (session as GameSession).player2) {
            currentQuestionIndex = (session as GameSession).currentQuestionIndexPlayer2 || 0;
        } else {
            throw new Error('Player not found in this session');
        }

        // Get the current question based on the index
        const currentQuestion = session.questions[currentQuestionIndex];
        if (!currentQuestion) {
            throw new Error('Current question not found');
        }

        // Check if the submitted answer is correct
        if (currentQuestion.correctAnswer === answer) {
            const currentScore = session.scores.get(playerId) || 0;
            session.scores.set(playerId, currentScore + 1);
        }

        // Update the current question index for the player
        if (playerId === (session as GameSession).player1) {
            (session as GameSession).currentQuestionIndexPlayer1++;
        } else if (playerId === (session as GameSession).player2) {
            (session as GameSession).currentQuestionIndexPlayer2++;
        }

        // Determine if the game is over for both players
        const isGameOver = (session as GameSession).currentQuestionIndexPlayer1 >= session.questions.length
            && (session as GameSession).currentQuestionIndexPlayer2 >= session.questions.length;

        // Save the updated session
        await session.save();
        return { isGameOver, session };
    }


}
