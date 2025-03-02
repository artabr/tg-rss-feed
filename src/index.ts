import express from 'express';
import TelegramProcessManager from './telegram-process-manager';
import RSSFeed from './feed';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import MarkdownIt from 'markdown-it';

dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const md = new MarkdownIt({
    html: true,
    linkify: true,
});

const app = express();

// Initialize Telegram process manager
const telegramManager = TelegramProcessManager.getInstance();

// Connect to Telegram before starting the server
const startServer = async () => {
    try {
        await telegramManager.connect();

        app.get('/', function (req, res) {
            try {
                const readmePath = path.join(__dirname, '..', 'README.md');
                const readmeContent = fs.readFileSync(readmePath, 'utf-8');
                const htmlContent = md.render(readmeContent);
                res.send(`
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
            try {
                const channelUsername = req.params.channel?.trim();
                if (!channelUsername) {
                    return res.status(400).json({ error: 'Channel username cannot be empty' });
                }

                const messages = await telegramManager.getMessagesFromChannel(channelUsername);
                res.json({ messages });
            } catch (error) {
                console.error('Error fetching messages:', error);
                res.status(500).json({ error: 'Failed to fetch messages' });
            }
        });

        app.get('/feed/:channel', async (req, res) => {
            try {
                const channelUsername = req.params.channel?.trim();
                const format = (req.query.format || 'rss') as string;

                if (!channelUsername) {
                    return res.status(400).json({ error: 'Channel username cannot be empty' });
                }

                const messages = await telegramManager.getMessagesFromChannel(channelUsername);
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
            try {
                const messageId = Number(req.params.messageId);
                const channelUsername = req.params.channel?.trim();

                if (!channelUsername) {
                    return res.status(400).json({ error: 'Channel username is required' });
                }

                if (isNaN(messageId)) {
                    return res.status(400).json({ error: 'Invalid message ID' });
                }

                const message = await telegramManager.getMessageById(channelUsername, messageId);
                if (!message) {
                    return res.status(404).json({ error: 'Message not found' });
                }

                res.json({ message });
            } catch (error) {
                console.error('Error fetching message:', error);
                res.status(500).json({ error: 'Failed to fetch message' });
            }
        });

        app.listen(port, host, () => {
            console.log(`[ ready ] http://${host}:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
