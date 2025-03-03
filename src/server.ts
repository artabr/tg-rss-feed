import path from 'path';
import fs from 'fs';
import RSSFeed from './feed';
import MarkdownIt from 'markdown-it';
import type { Express } from 'express';
import type TelegramBotClient from './telegram-client';

const md = new MarkdownIt({
  html: true,
  linkify: true,
});

// Connect to Telegram before making a request
const telegramClientConnect = async (telegramClient: TelegramBotClient) => {
  try {
    await telegramClient.connect();
  } catch (error) {
    console.error('Failed to connect to Telegram:', error);
  }
};

export const bootstrapServer = (app: Express, telegramClient: TelegramBotClient) => {
  try {
    app.get('/', function (req, res) {
      try {
        const readmePath = path.join(process.cwd(), 'README.md');
        const readmeContent = fs.readFileSync(readmePath, 'utf-8');
        const htmlContent = md.render(readmeContent);
        res.status(200).send(`
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <title>TG RSS Feed</title>
                            <style>
                                body {
                                    max-width: 800px;
                                    margin: 0 auto;
                                    padding: 20px;
                                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                    line-height: 1.6;
                                    color: #333;
                                }
                                pre {
                                    background-color: #f6f8fa;
                                    padding: 16px;
                                    border-radius: 6px;
                                    overflow-x: auto;
                                }
                                code {
                                    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
                                }
                            </style>
                        </head>
                        <body>
                            ${htmlContent}
                        </body>
                    </html>
                `);
      } catch (error) {
        console.error('Error reading README:', error);
        res.status(500).send('Error loading documentation');
      }
    });

    app.get('/messages/:channel', async (req, res) => {
      await telegramClientConnect(telegramClient);

      try {
        const channelUsername = req.params.channel?.trim();
        if (!channelUsername) {
          return res.status(400).json({ error: 'Channel username cannot be empty' });
        }

        const messages = await telegramClient.getMessagesFromChannel(channelUsername);
        res.json({ messages });
      } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
      }
    });

    app.get('/feed/:channel', async (req, res) => {
      await telegramClientConnect(telegramClient);

      try {
        const channelUsername = req.params.channel?.trim();
        const format = (req.query.format || 'rss') as string;

        if (!channelUsername) {
          return res.status(400).json({ error: 'Channel username cannot be empty' });
        }

        const messages = await telegramClient.getMessagesFromChannel(channelUsername);
        const feed = new RSSFeed(channelUsername);
        feed.addMessages(messages, channelUsername);

        let feedContent: string;
        let contentType: string;

        switch (format.toLowerCase()) {
          case 'atom':
            feedContent = feed.getAtomFeed();
            contentType = 'application/atom+xml';
            break;
          case 'json':
            feedContent = feed.getJsonFeed();
            contentType = 'application/json';
            break;
          default: // RSS
            feedContent = feed.getRssFeed();
            contentType = 'application/rss+xml';
        }

        res.setHeader('Content-Type', contentType);
        res.send(feedContent);
      } catch (error) {
        console.error('Error generating feed:', error);
        res.status(500).json({ error: 'Failed to generate feed' });
      }
    });

    app.get('/messages/:channel/:messageId', async (req, res) => {
      await telegramClientConnect(telegramClient);

      try {
        const messageId = Number(req.params.messageId);
        const channelUsername = req.params.channel?.trim();

        if (!channelUsername) {
          return res.status(400).json({ error: 'Channel username is required' });
        }

        if (isNaN(messageId)) {
          return res.status(400).json({ error: 'Invalid message ID' });
        }

        const message = await telegramClient.getMessageById(channelUsername, messageId);
        if (!message) {
          return res.status(404).json({ error: 'Message not found' });
        }

        res.json({ message });
      } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ error: 'Failed to fetch message' });
      }
    });
  } catch (error) {
    console.error('Failed to bootstrap the server:', error);
    process.exit(1);
  }
};

