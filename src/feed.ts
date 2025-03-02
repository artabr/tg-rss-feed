import { Feed } from 'feed';
import { TelegramMessage } from './telegram-client';

class RSSFeed {
    private feed: Feed;

    constructor(channelUsername: string) {
        this.feed = new Feed({
            title: `Telegram Channel: ${channelUsername}`,
            description: `RSS Feed for Telegram channel ${channelUsername}`,
            id: `telegram-${channelUsername}`,
            link: `https://t.me/${channelUsername}`,
            language: 'en',
            updated: new Date(),
            generator: 'Telegram RSS Feed Generator',
            copyright: 'All rights reserved',
        });
    }

    public addMessages(messages: TelegramMessage[], channelUsername: string): void {
        messages.forEach(message => {
            if (!message.message || message.message === "") return;

            const date = new Date(message.date * 1000);
            const link = message.url || `https://t.me/${channelUsername}/${message.id}`;

            this.feed.addItem({
                title: this.generateTitle(message.message),
                id: message.id.toString(),
                link: link,
                description: message.message,
                date: date,
                // Add media if available
                // image: message.media?.photo ? {
                //     url: message.media.photo.url,
                // } : undefined,
            });
        });

        // Sort items by date
        this.feed.items.sort((a, b) =>
            (b.date?.getTime() || 0) - (a.date?.getTime() || 0)
        );
    }

    private generateTitle(message: string): string {
        // Generate a title from the first line or first few words of the message
        const firstLine = message.split('\n')[0];
        if (firstLine.length <= 100) return firstLine;
        return firstLine.substring(0, 97) + '...';
    }

    public getRssFeed(): string {
        return this.feed.rss2();
    }

    public getAtomFeed(): string {
        return this.feed.atom1();
    }

    public getJsonFeed(): string {
        return this.feed.json1();
    }
}

export default RSSFeed;
