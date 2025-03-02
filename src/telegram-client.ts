import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

class TelegramBotClient {
    private readonly client: TelegramClient;
    private static instance: TelegramBotClient;

    private constructor() {
        if (!process.env.BOT_TOKEN) {
            throw new Error('BOT_TOKEN environment variable is required');
        }

        // Initialize the client with bot token
        this.client = new TelegramClient(
            new StringSession(''), // Empty session for bot
            Number(process.env.API_ID), // Telegram API ID
            process.env.API_HASH!, // Telegram API Hash
            {
                connectionRetries: 5,
            }
        );
    }

    public static getInstance(): TelegramBotClient {
        if (!TelegramBotClient.instance) {
            TelegramBotClient.instance = new TelegramBotClient();
        }
        return TelegramBotClient.instance;
    }

    public async connect(): Promise<void> {
        try {
            await this.client.start({
                botAuthToken: process.env.BOT_TOKEN!
            });
            console.log('Telegram bot client connected successfully');
        } catch (error) {
            console.error('Failed to connect Telegram bot client:', error);
            throw error;
        }
    }

    public async getMessagesFromChannel(channelUsername: string, limit: number = 10) {
        try {
            const channel = await this.client.getEntity(channelUsername);
            const messages = await this.client.invoke(
              new Api.channels.GetMessages({
                  channel,
                  id: [new Api.InputMessageID({ id: 43 })],
              })
            );
            return messages;
        } catch (error) {
            console.error('Failed to get messages from channel:', error);
            throw error;
        }
    }

    public getClient(): TelegramClient {
        return this.client;
    }
}

export default TelegramBotClient;
