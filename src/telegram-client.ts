import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import NodeCache from 'node-cache';

interface TelegramMessage {
    message: string;
    [key: string]: any;
}

interface MessagesResponse {
    messages: TelegramMessage[];
    [key: string]: any;
}

class TelegramBotClient {
    private readonly client: TelegramClient;
    private static instance: TelegramBotClient;
    private readonly cache: NodeCache;
    private readonly CACHE_TTL = 8 * 60 * 60; // 8 hours in seconds
    private readonly MESSAGES_CACHE_KEY = 'channel_messages';
    private readonly LAST_MESSAGE_ID_KEY = 'last_message_id';

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

        // Initialize cache with 8 hours TTL
        this.cache = new NodeCache({ stdTTL: this.CACHE_TTL });
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

    public async getMessagesFromChannel(channelUsername: string) {
        try {
            const channel = await this.client.getEntity(channelUsername);
            const cacheKey = `${this.MESSAGES_CACHE_KEY}_${channelUsername}`;
            const lastMessageIdKey = `${this.LAST_MESSAGE_ID_KEY}_${channelUsername}`;
            
            // Get cached messages if they exist
            let messages = this.cache.get(cacheKey) as TelegramMessage[] || [];
            let lastProcessedId = this.cache.get(lastMessageIdKey) as number || 0;
            
            // Start from the next message after the last processed one
            let currentId = lastProcessedId + 1;
            const maxId = 1000000;

            while (currentId <= maxId) {
                try {
                    const result = await this.client.invoke(
                        new Api.channels.GetMessages({
                            channel,
                            id: [new Api.InputMessageID({ id: currentId })],
                        })
                    ) as MessagesResponse;

                    // Check if we got a valid message
                    if (!result?.messages?.[0] || !result.messages[0].message) {
                        // No more messages or empty message, stop the loop
                        break;
                    }

                    // Add the message to our collection
                    messages.push(result.messages[0]);
                    lastProcessedId = currentId;

                    // Update cache
                    this.cache.set(cacheKey, messages);
                    this.cache.set(lastMessageIdKey, lastProcessedId);

                    currentId++;
                } catch (error) {
                    console.error(`Failed to fetch message ID ${currentId}:`, error);
                    // If we encounter an error, move to the next message
                    currentId++;
                    continue;
                }
            }

            return messages;
        } catch (error) {
            console.error('Failed to get messages from channel:', error);
            throw error;
        }
    }

    public async getMessageById(channelUsername: string, messageId: number) {
        try {
            const channel = await this.client.getEntity(channelUsername);
            const messages = await this.client.invoke(
                new Api.channels.GetMessages({
                    channel,
                    id: [new Api.InputMessageID({ id: messageId })],
                })
            );
            return messages;
        } catch (error) {
            console.error('Failed to get message by ID:', error);
            throw error;
        }
    }

    public getClient(): TelegramClient {
        return this.client;
    }
}

export default TelegramBotClient;
