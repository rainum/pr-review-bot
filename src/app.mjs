import express from 'express';
import helmet from 'helmet';
import errors from 'http-errors';
import logger from 'pino-http';

import { handleErrors, logErrors } from './middleware/errors.mjs';
import { verify } from './middleware/signature.mjs';
import { postReviewNotification, updateReviewNotification } from './slack.mjs';

const app = express();

app.use(logger());
app.use(helmet());
app.use(express.json({ verify }));

// this endpoint receives webhooks from the GitHub
app.post('/webhook', async (req, res, next) => {
  const { 'x-github-event': eventName, 'user-agent': userAgent } = req.headers;

  // ensure that this is a GitHub webhook request
  if (userAgent.indexOf('GitHub-Hookshot/') !== 0) {
    return next(errors.BadRequest(`"${userAgent}" is invalid user-agent.`));
  }

  // always return 200 on ping requests
  if (eventName === 'ping') {
    res.sendStatus(200);
    return;
  }

  const payload = req.body;

  // Make sure to track only PR-related events
  if (eventName !== 'pull_request') {
    return next(
      errors.BadRequest(
        `Event "${eventName}" is not supported. You need to configure your webhook properly.`,
      ),
    );
  }

  // Make sure to handle only PRs that are ready for review
  if (['opened', 'reopened', 'ready_for_review', 'review_requested'].includes(payload.action)) {
    await postReviewNotification(payload.pull_request, req.log);
  }

  // After PR is closed or merged remove the notification from channel
  if (payload.action === 'closed') {
    await updateReviewNotification(payload.pull_request, req.log);
  }

  res.sendStatus(200);
});

// error logging
app.use(logErrors);

// error handling
app.use(handleErrors);

export default app;
