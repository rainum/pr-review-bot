import fs from 'node:fs';
import path from 'node:path';
import { cleanEnv, port, str, url } from 'envalid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SECRETS_DIR = path.join(__dirname, '../secrets');
const secrets = {};

if (fs.existsSync(SECRETS_DIR)) {
  const files = fs.readdirSync(SECRETS_DIR);

  for (const file of files) {
    secrets[file] = fs.readFileSync(path.join(SECRETS_DIR, file), 'utf8').toString().trim();
  }
}

export default cleanEnv(Object.assign({}, process.env, secrets), {
  NODE_ENV: str({
    default: process.env.NODE_ENV || 'production',
  }),

  PORT: port({
    default: 3000,
    desc: 'The port to start the server on',
  }),

  SLACK_TOKEN: str(),

  SLACK_CHANNEL_ID: str(),

  GITHUB_WEBHOOK_SECRET: str(),
});
