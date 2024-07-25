import crypto from 'crypto';
import errors from 'http-errors';

import env from '../env.mjs';

// check webhook signature
export const verify = (req, _res, buf) => {
  const signature = req.headers['x-hub-signature-256'];

  if (!signature) {
    throw errors.BadRequest('Signature header is missing.');
  }

  const [method, hash] = signature.split('=');

  const expectedHash = crypto
    .createHmac(method, env.GITHUB_WEBHOOK_SECRET)
    .update(buf)
    .digest('hex');

  if (expectedHash !== hash) {
    throw errors.Unauthorized('Failed to validate request signature.');
  }
};
