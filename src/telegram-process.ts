import TelegramBotClient from './telegram-client';

// Initialize Telegram client
const telegramClient = TelegramBotClient.getInstance();

process.on('message', async (message: any) => {
    if (!process.send) return;

    try {
        switch (message.type) {
            case 'connect':
                await telegramClient.connect();
                process.send({ type: 'connected' });
                break;
            case 'getMessages':
                const messages = await telegramClient.getMessagesFromChannel(message.channelUsername);
                process.send({ type: 'messages', data: messages });
                break;
            case 'getMessage':
                const msg = await telegramClient.getMessageById(message.channelUsername, message.messageId);
                process.send({ type: 'message', data: msg });
                break;
        }
    } catch (error) {
        process.send({ type: 'error', error: error.message });
    }
});

// Keep the process alive
process.on('SIGTERM', () => {
    process.exit(0);
}); 