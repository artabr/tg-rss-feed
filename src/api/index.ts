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

bootstrapServer(app, telegramClient);

app.get('/test-route', function (req, res) {
  res.status(200).send('Hello World!/test-route');
});

app.get('*',function (req, res) {
  res.redirect('/');
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

// Connect to Telegram before starting the server
const telegramClientConnect = async () => {
  try {
    await telegramClient.connect();
  } catch (error) {
    console.error('Failed to connect to Telegram:', error);
  }
};

telegramClientConnect();

/**
 * This exposes the Express application as a serverless function handler for Vercel deployment
 *
 * Express instance itself is a request handler, which could be invoked as a serverless function on Vercel's infrastructure
 *
 * For local development, the app can still be run using `nx serve` which will use a local development server
 * Although this code is not used in this case - see /src/index.ts
 */
export default app;
