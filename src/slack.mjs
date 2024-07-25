import { WebClient } from '@slack/web-api';

import env from './env.mjs';

const client = new WebClient(env.SLACK_TOKEN);

// map Slack users to GitHub usernames
const GH_TO_SLACK_USERS_MAP = {
  'stoplight-qa': 'vazha',
  johndoe156: 'John Doe',
};

// remove any possible duplicates from users map
const usersMap = new Map(Object.entries(GH_TO_SLACK_USERS_MAP));

export const postReviewNotification = async (pr, log) => {
  // create an array of Slack mentions, include only existing users
  const mentions = pr.requested_reviewers.reduce((acc, { login }) => {
    const slackUser = usersMap.get(login);

    if (slackUser) {
      acc.push(`<@${slackUser}>`);
    }

    return acc;
  }, []);

  // no point in posting message since there is no one to tag
  if (!mentions.length) {
    return;
  }

  const message = await getExistingNotification(pr);
  const text = `The following PR is ready for review: ${pr.url}. Reviewers: ${mentions.join(', ')}`;

  // if notification exists simply update the text
  if (message) {
    await updateMessage(log, message, text);
    return;
  }

  await postMessage(log, text);
};

export const updateReviewNotification = async (pr, log) => {
  const message = await getExistingNotification(pr);

  if (!message) {
    return;
  }

  await updateMessage(log, message, `~${message.text}~\n:white_check_mark: PR is merged!`);
};

const getMessages = async channel => {
  let messages = [];

  /**
   * REFACTOR: we need to store all message ID to PR ID relations in database
   * in order to be able to get a single message instead. As another option
   * we can make lookup narrower by fetching message after PR creation date
   */

  for await (const page of client.paginate('conversations.history', { channel })) {
    if (page.messages?.length) {
      messages = messages.concat(page.messages);
    }
  }

  return messages;
};

const getExistingNotification = async pr => {
  const messages = await getMessages(env.SLACK_CHANNEL_ID);

  return messages.find(({ text }) => text.includes(pr.url));
};

const updateMessage = async (log, message, text) => {
  const { ts } = await client.chat.update({
    channel: env.SLACK_CHANNEL_ID,
    ts: message.ts,
    text,
  });

  log.info(`Updated message ${ts} in conversation ${env.SLACK_CHANNEL_ID}`);
};

const postMessage = async (log, text) => {
  const { ts } = await client.chat.postMessage({
    channel: env.SLACK_CHANNEL_ID,
    text,
  });

  log.info(`Send message ${ts} in conversation ${env.SLACK_CHANNEL_ID}`);
};
