# pr-review-bot

This bot sends notifications to a Slack channel about requested PR reviews and tags reviewers in the
message.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Secrets Directory](#secrets-directory)
- [Webhook Configuration](#webhook-configuration)
- [Installation](#installation)
- [Running the Bot](#running-the-bot)
  - [Production](#production)
  - [Development](#development)
- [Using ngrok for Local Development](#using-ngrok-for-local-development)
- [Code Structure](#code-structure)

## Environment Variables

The bot uses the following environment variables:

- `GITHUB_WEBHOOK_SECRET`: The secret token for verifying GitHub webhooks.
- `SLACK_CHANNEL_ID`: The ID of the Slack channel where notifications will be sent.
- `SLACK_TOKEN`: The token for authenticating with the Slack API.

## Secrets Directory

Secrets directory is optional. You can provide secrets as environment variables. But if you want to
use the secrets directory, you can put your secrets there. Each secret should be in a separate file
with the name of the environment variable. The secrets directory should look like the following:

```
./secrets
├── GITHUB_WEBHOOK_SECRET
├── SLACK_CHANNEL_ID
└── SLACK_TOKEN
```

## Webhook Configuration

Here is an example of webhook configuration:

![webhook_configuration](https://github.com/user-attachments/assets/7fb482e3-3521-4e5e-b954-6deaa1b4c705)

## Installation

To install the dependencies, run:

```bash
yarn install
```

## Running the Bot

### Production

To start the bot in production mode, use the following command:

```bash
yarn start
```

### Development

To start the bot in development mode, use the following command:

```bash
yarn dev
```

## Using ngrok for Local Development

When developing locally, you need to expose your local server to the internet to receive GitHub
webhooks. You can use [ngrok](https://ngrok.com/) for this purpose.

1. Install ngrok:

   ```bash
   brew install ngrok
   ```

2. Start ngrok to expose your local server:

   ```bash
   ngrok http 3000
   ```

3. Copy the forwarding URL provided by ngrok (e.g., `https://<your-ngrok-subdomain>.ngrok.io`) and
   use it as the webhook URL in your GitHub repository settings.

## Code Structure

- `src/app.mjs`: Main application file that sets up the Express server and handles incoming
  webhooks.
- `src/env.mjs`: Handles environment variables and secrets.
- `src/slack.mjs`: Contains functions for posting and updating Slack messages.
- `src/middleware/errors.mjs`: Middleware for error handling.
- `src/middleware/signature.mjs`: Middleware for verifying GitHub webhook signatures.
