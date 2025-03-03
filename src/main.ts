import express from 'express';
import TelegramBotClient from './telegram-client';
import * as dotenv from 'dotenv';
import { bootstrapServer } from './server';

dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// Initialize Telegram client
const telegramClient = TelegramBotClient.getInstance();

// Connect to Telegram before starting the server
const startServer = async () => {
    try {
        await telegramClient.connect();

        bootstrapServer(app, telegramClient);

        app.listen(port, host, () => {
            console.log(`[ ready ] http://${host}:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

/**
 * This will start a classic "serverful" Express application that requires a Node.js server to run
 *
 * You can use this in a traditional server environment by running `build` and `serve` commands
 *
 * This is not used in a Vercel deployment - see /api/index.ts instead
 */
startServer();
