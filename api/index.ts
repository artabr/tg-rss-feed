require('dotenv').config();

const express = require('express');
const TelegramBotClient = require('../dist/tg-rss-feed/src/telegram-client.js');
const { bootstrapServer } = require('../dist/tg-rss-feed/src/server.js');

const app = express();

// Initialize Telegram client
const telegramClient = TelegramBotClient.getInstance();

// Connect to Telegram before starting the server
const startServer = async () => {
  try {
    await telegramClient.connect();

    bootstrapServer(app, telegramClient);
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
module.exports = app;
