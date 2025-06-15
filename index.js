import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import { createLogger, transports, format } from 'winston';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { HttpsProxyAgent } from 'proxy-agent';

// Initialize environment variables
dotenv.config();

// Configure logger
const __dirname = dirname(fileURLToPath(import.meta.url));
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ 
      filename: join(__dirname, 'logs/checkin.log'),
      maxsize: 5 * 1024 * 1024 // 5MB
    })
  ]
});

// Display banner
const now = new Date().toLocaleString();
console.log(chalk.cyan(
  \n🚀 Enhanced Crypto DAI Auto Check-In Bot\n📅 Started: ${now}\n
));

// Validate and load tokens
function loadTokens() {
  const tokens = process.env.TOKENS?.split(',')?.filter(Boolean) || [];
  
  if (!tokens.length) {
    console.error(chalk.red('❌ No tokens found in environment variables!'));
    logger.error('No tokens provided');
    process.exit(1);
  }

  return tokens.map(token => token.trim());
}

const tokens = loadTokens();

// Configure axios with proxy if available
const axiosConfig = {};
if (process.env.PROXY_URL) {
  axiosConfig.httpsAgent = new HttpsProxyAgent(process.env.PROXY_URL);
  console.log(chalk.yellow('ℹ Using proxy for requests'));
}

const api = axios.create(axiosConfig);

// Enhanced main function
let success = 0;
let failed = 0;
const processedAccounts = new Set();

const delay = ms => new Promise(res => setTimeout(res, ms));

async function checkTokenValidity(token) {
  try {
    const response = await api.get('https://api.hi-pin.com/api/v1/user/profile', {
      headers: { Authorization: Bearer ${token} },
      timeout: 10000
    });
    return response.data?.data || null;
  } catch (error) {
    logger.error(Token validation failed: ${error.message}, { token: token.slice(0, 5) });
    return null;
  }
}

async function performCheckIn(token, userInfo) {
  try {
    await api.post('https://api.hi-pin.com/api/v1/user/check-in', {}, {
      headers: { Authorization: Bearer ${token} },
      timeout: 10000
    });
    return true;
  } catch (error) {
    logger.error(Check-in failed: ${error.message}, {
      token: token.slice(0, 5),
      status: error.response?.status,
      user: userInfo?.name
    });
    return false;
  }
}

async function processToken(token) {
  const spinner = ora(Processing token: ${token.slice(0, 5)}...).start();
  
  try {
    const userInfo = await checkTokenValidity(token);
    
    if (!userInfo) {
      spinner.fail(Invalid token: ${token.slice(0, 5)});
      failed++;
      return;
    }

    if (processedAccounts.has(userInfo.id)) {
      spinner.warn(Duplicate account: ${userInfo.name || 'Unknown'});
      return;
    }

    if (userInfo.isCheckIn) {
      spinner.succeed(Already checked in: ${userInfo.name || 'Unknown'});
      processedAccounts.add(userInfo.id);
      return;
    }

    const checkInSuccess = await performCheckIn(token, userInfo);
    
    if (checkInSuccess) {
      success++;
      spinner.succeed(Success: ${userInfo.name || 'Unknown'} (Balance: ${userInfo.balance || 0} DAI));
      processedAccounts.add(userInfo.id);
    } else {
      failed++;
      spinner.fail(Failed: ${userInfo.name || 'Unknown'});
    }
  } catch (error) {
    failed++;
    spinner.fail(Error: ${error.message});
    logger.error('Processing error', { error: error.message });
  }
}

async function runBot() {
  console.log(chalk.blue(ℹ Processing ${tokens.length} tokens...\n));
  
  for (const token of tokens) {
    await processToken(token);
    await delay(2000 + Math.random() * 1000); // Random delay between 2-3s
  }

  const summary = \n✅ Success: ${success} | ❌ Failed: ${failed} | 🚫 Duplicates: ${tokens.length - success - failed};
  console.log(chalk.greenBright(summary));
  logger.info('Check-in completed', { success, failed });
}

runBot().catch(error => {
  console.error(chalk.red('\n⚠️ Critical error:'), error.message);
  logger.error('Bot crashed', { error: error.message });
  process.exit(1);
});
