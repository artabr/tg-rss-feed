import express from 'express';
import TelegramBotClient from './telegram-client';
import * as dotenv from 'dotenv';

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
        
        app.get('/', async (req, res) => {
            try {
                const channelUsername = req.query.channel as string;
                if (!channelUsername) {
                    return res.status(400).json({ error: 'Channel username is required' });
                }
                
                const limit = req.query.limit ? Number(req.query.limit) : 10;
                const messages = await telegramClient.getMessagesFromChannel(channelUsername, limit);
                res.json({ messages });
            } catch (error) {
                console.error('Error fetching messages:', error);
                res.status(500).json({ error: 'Failed to fetch messages' });
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
