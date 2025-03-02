import express from 'express';
import TelegramProcessManager from './telegram-process-manager';
import RSSFeed from './feed';
import * as dotenv from 'dotenv';

dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// Initialize Telegram process manager
const telegramManager = TelegramProcessManager.getInstance();

// Connect to Telegram before starting the server
const startServer = async () => {
    try {
        await telegramManager.connect();

        app.get('/:channel', async (req, res) => {
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

        app.get('/message/:messageId', async (req, res) => {
            try {
                const messageId = Number(req.params.messageId);
                const channelUsername = req.query.channel as string;

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
