// index.js
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';

// Small banner
const now = new Date().toLocaleString();
console.log(chalk.cyan(
  \ncrypto dai auto check-in bot\nstarted: ${now}\n
));

// Load tokens from tokens.json
let tokens = [];
try {
  const tokensRaw = fs.readFileSync('./tokens.json', 'utf8');
  const tokenObjects = JSON.parse(tokensRaw);
  tokens = tokenObjects.map(obj => obj.token);
  if (tokens.length === 0) {
    console.error(chalk.red('❌ No tokens found in tokens.json! Please add tokens.'));
    process.exit(1);
  }
} catch (err) {
  console.error(chalk.red('❌ Failed to read tokens.json. Make sure the file exists and is valid JSON.'));
  process.exit(1);
}

// Main function
let success = 0;
let failed = 0;
const delay = ms => new Promise(res => setTimeout(res, ms));

async function runBot() {
  for (const token of tokens) {
    const spinner = ora(Processing token: ${token.slice(0, 10)}...).start();

    try {
      const profile = await axios.get('https://api.hi-pin.com/api/v1/user/profile', {
        headers: { Authorization: Bearer ${token} }
      });

      const checkedIn = profile.data?.data?.isCheckIn;

      if (checkedIn) {
        spinner.succeed(Already checked in: ${profile.data?.data?.name || 'Unknown'});
      } else {
        await axios.post('https://api.hi-pin.com/api/v1/user/check-in', {}, {
          headers: { Authorization: Bearer ${token} }
        });

        success++;
        spinner.succeed(Checked in successfully: ${profile.data?.data?.name || 'Unknown'});
      }
    } catch (error) {
      failed++;
      spinner.fail(Failed for token: ${token.slice(0, 10)} - ${error.response?.status || error.message});
    }

    await delay(2000);
  }

  console.log(chalk.greenBright(\nAll done! Success: ${success}, Failed: ${failed}\n));
}

runBot();
