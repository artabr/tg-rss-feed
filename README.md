# Telegram RSS Feed

A simple and easy to deploy RSS feed for your Telegram channels built with GramJS and Express. This app allows you to distribute messages from your Telegram channels to RSS feeds.

Then you can subscribe to the feed and distribute the messages to your audience on other platforms.

## One-Click Deploy

Deploy the app using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/artabr/tg-rss-feed&project-name=tg-rss-feed&repository-name=tg-rss-feed)

Please deploy your own copy of the repository to your own Vercel account. It's free and easy to do.

Do not use my Vercel deployment as it may go down at any time.

## 🚀 Features

- Creates RSS feeds from all messages in your Telegram channels
- Easy deployment to Vercel

## 📖 Usage

### Available Routes

- `/feed/<channel_name>`: Get RSS feed for a specific channel
  - Example: `https://your-deployment.vercel.app/feed/mychannel`
  - Replace `<channel_name>` with your Telegram channel's username (without the @ symbol)
  - This URL can be added to any RSS reader to subscribe to the channel's updates


- `/messages/<channel_name>`: Get a list of all messages from a specific channel
  - Example: `https://your-deployment.vercel.app/messages/mychannel`
  - Returns a JSON array of all messages with their IDs, content, and metadata
  - Useful for browsing channel history or building custom integrations


- `/messages/<channel_name>/<message_id>`: Get a specific message from a channel
  - Example: `https://your-deployment.vercel.app/messages/mychannel/12345`
  - Returns detailed information about a single message in JSON format
  - Includes message content, media attachments, and metadata

### Subscribing to Feeds

1. Deploy your instance of the app following the deployment instructions below
2. Get your channel's feed URL: `https://your-deployment.vercel.app/feed/<channel_name>`
3. Add this URL to your favorite RSS reader (like [QuiteRSS](https://quiterss.org), Feedly, or any other RSS reader)
4. Your RSS reader will now automatically fetch new posts from your Telegram channel

### Example

If your Telegram channel is [@feat_initial_commit](https://t.me/feat_initial_commit) and you've deployed to Vercel at `https://tg-rss-feed.vercel.app/`:
- Your feed URL would be: [https://tg-rss-feed.vercel.app/feed/feat_initial_commit](https://tg-rss-feed.vercel.app/feed/feat_initial_commit)

## 📋 Prerequisites

- bun
- Telegram account
- Vercel account (for deployment)

## 🔑 Environment Variables

The following environment variables are required:

```env
# Telegram API Credentials
BOT_TOKEN=your_bot_token_here
API_ID=your_api_id_here
API_HASH=your_api_hash_here
```

### Getting Telegram Credentials

1. **API ID and Hash ID:**
   - Visit [my.telegram.org](https://my.telegram.org)
   - Log in with your phone number
   - Go to 'API development tools'
   - Create a new application
   - Copy the `api_id` and `api_hash`

2. **Bot Token:**
   - Open Telegram and search for [@BotFather](https://t.me/botfather)
   - Send `/newbot` command
   - Follow the instructions to create your bot
   - Copy the provided bot token

## 💻 Development

This project uses NX for development. Here's how to get started:

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Telegram credentials

3. **Start the development server:**
   ```bash
   bunx nx serve tg-rss-feed
   ```

4. **Build for production:**
   ```bash
   bunx nx build tg-rss-feed
   ```

## 🚀 Deployment

### Vercel Deployment

1. Fork this repository
2. Create a new project in Vercel
3. Configure the following environment variables in Vercel's admin panel:
   - Go to Project Settings > Environment Variables
   - Add the following variables:
     - `BOT_TOKEN`
     - `API_ID`
     - `API_HASH`
4. Deploy using the "Deploy" button at the top of this README

## 📚 Documentation

For more detailed information about the workspace setup and NX capabilities:
- [NX Documentation](https://nx.dev)
- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
