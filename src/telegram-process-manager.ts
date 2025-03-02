import { fork, ChildProcess } from 'child_process';
import path from 'path';

class TelegramProcessManager {
    private static instance: TelegramProcessManager;
    private process: ChildProcess | null = null;
    private isConnected = false;

    private constructor() {}

    public static getInstance(): TelegramProcessManager {
        if (!TelegramProcessManager.instance) {
            TelegramProcessManager.instance = new TelegramProcessManager();
        }
        return TelegramProcessManager.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected) return;

        return new Promise((resolve, reject) => {
            this.process = fork(path.join(__dirname, 'telegram-process.js'));

            this.process.on('message', (message: any) => {
                if (message.type === 'connected') {
                    this.isConnected = true;
                    resolve();
                } else if (message.type === 'error') {
                    reject(new Error(message.error));
                }
            });

            this.process.send({ type: 'connect' });
        });
    }

    public async getMessagesFromChannel(channelUsername: string): Promise<any[]> {
        if (!this.process || !this.isConnected) {
            throw new Error('Telegram process not connected');
        }

        return new Promise((resolve, reject) => {
            const handler = (message: any) => {
                if (message.type === 'messages') {
                    this.process?.off('message', handler);
                    resolve(message.data);
                } else if (message.type === 'error') {
                    this.process?.off('message', handler);
                    reject(new Error(message.error));
                }
            };

            this.process.on('message', handler);
            this.process.send({ type: 'getMessages', channelUsername });
        });
    }

    public async getMessageById(channelUsername: string, messageId: number): Promise<any> {
        if (!this.process || !this.isConnected) {
            throw new Error('Telegram process not connected');
        }

        return new Promise((resolve, reject) => {
            const handler = (message: any) => {
                if (message.type === 'message') {
                    this.process?.off('message', handler);
                    resolve(message.data);
                } else if (message.type === 'error') {
                    this.process?.off('message', handler);
                    reject(new Error(message.error));
                }
            };

            this.process.on('message', handler);
            this.process.send({ type: 'getMessage', channelUsername, messageId });
        });
    }
}

export default TelegramProcessManager; 