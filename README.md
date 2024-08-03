# Real-Time Quiz Game Backend
This project is a backend implementation for a real-time quiz game where two players compete against each other by answering the same set of questions. The game uses NestJS, MongoDB, and WebSockets to handle real-time communication, user authentication, game session management, and more.

## Features

- **User Authentication**: Secure registration and login using JWT.
- **Game Session Setup**: Create and manage game sessions, and notify players when the game starts.
- **Question Management**: Pre-store questions in MongoDB, each with multiple choices and a correct answer.
- **Real-Time Question Delivery**: Send questions to players one by one in real-time.
- **Answer Submission and Scoring**: Handle player answers, validate them, and calculate scores.
- **Result Calculation**: Determine the winner after all questions are answered and store the game results.

## Tech Stack

- **Backend**: NestJS
- **Database**: MongoDB
- **Real-Time Communication**: WebSockets (using Socket.IO)
- **Authentication**: JWT for user authentication

## Installation

### Prerequisites

- Node.js
- MongoDB (local or cloud instance)

### Steps

1. **Clone the repository**:
    ```bash
    git clone https://github.com/h1manshu99/quiz-game.git
    cd quiz-game
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Start the server**:
    ```bash
    npm run start
    ```

4. **Access the API**:
    The server will run at `http://localhost:3000`.

## WebSocket Events

- **`connect`**: Initial socket to connect users to socket client.
- **`register`**: Triggered to register players id to their respective socket client.
- **`game:init`**: Triggered when a game session starts, notifying both players.
- **`question:send`**: Sends the next question to players.
- **`answer:submit`**: Handles player’s answer submission and updates scores.
- **`game:end`**: Notifies players when the game ends and provides final scores.
