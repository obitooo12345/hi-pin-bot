# 🚀 Crypto DAI Auto Check-In Bot

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enhanced automated check-in bot for Crypto DAI that handles multiple accounts securely with proxy support and detailed logging.

## ✨ Features

- ✅ Multi-account support - Process multiple tokens simultaneously
- 🔒 Secure token handling - Uses environment variables instead of plain text files
- 🌐 Proxy support - Configure proxy for all requests
- 📊 Detailed logging - File logging with Winston
- ⏱ Smart delays - Random delays between requests to avoid detection
- 📝 Comprehensive reporting - Success/failure/duplicate statistics
- 💰 Balance display - Shows account balance after successful check-in



## 🚀 Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/crypto-dai-auto-checkin.git
   cd crypto-dai-auto-checkin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   nano .env  # Edit with your tokens
   ```

## ⚙️ Usage
```bash
node index.js
```
*(Copy buttons will appear for all blocks above!)*

ini
# Add your tokens separated by commas
TOKENS=your_token_1_here,your_token_2_here

# Optional proxy configuration
# PROXY_URL=http://username:password@proxyip:port
🚀 Usage
Run the bot:

bash
npm start
Sample output:

text
🚀 Enhanced Crypto DAI Auto Check-In Bot
📅 Started: 5/1/2024, 3:45:27 PM

ℹ Processing 2 tokens...

✔ Success: JohnDoe (Balance: 42.5 DAI)
✔ Success: JaneDoe (Balance: 18.2 DAI)

✅ Success: 2 | ❌ Failed: 0 | 🚫 Duplicates: 0
📂 File Structure
text
.
├── .env.example            # Environment variables template
├── index.js                # Main bot script
├── package.json            # Project dependencies
├── package-lock.json       # Lock file
└── logs/
    └── checkin.log         # Generated log file
    
