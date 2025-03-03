import express from 'express';
import TelegramBotClient from '../telegram-client';
import * as dotenv from 'dotenv';
import { bootstrapServer } from '../server';

dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use((req, res, next) => {
  console.log(req);
  next();
});

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

startServer();

/**
 * This exposes the Express application as a serverless function handler for Vercel deployment
 *
 * Express instance itself is a request handler, which could be invoked as a serverless function on Vercel's infrastructure
 *
 * For local development, the app can still be run using `nx serve` which will use a local development server
 * Although this code is not used in this case - see /src/index.ts
 */
export default app;
