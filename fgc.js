import fs from 'fs';
import { cfg } from './src/config.js';
import enquirer from 'enquirer';
import { dataDir } from './src/util.js';

const configPath = dataDir('config.env');

// Simple Base64 encode/decode
function encodeBase64(str) {
  if (!str) return '';
  return Buffer.from(str).toString('base64');
}

function decodeBase64(str) {
  if (!str) return '';
  // Try decoding only if it looks like base64
  try {
    return Buffer.from(str, 'base64').toString('utf8');
  } catch (e) {
    return str;
  }
}

async function runConfig() {
  console.log('--- Free Games Claimer Configuration Assistant ---');
  console.log(`Settings will be saved to ${configPath}\n`);

  const existingConfig = {};
  try {
    const raw = await fs.promises.readFile(configPath, 'utf8');
    raw.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        existingConfig[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  const getDef = (key, def = '') => {
    let val = existingConfig[key] || def;
    if (val && key.includes('PASSWORD')) {
      val = decodeBase64(val);
    }
    return val;
  };

  const { prompt } = enquirer;

  const response = await prompt([
    {
      type: 'input',
      name: 'EMAIL',
      message: 'Default Email Address (used for all stores if not overridden):',
      initial: getDef('EMAIL'),
    },
    {
      type: 'password',
      name: 'PASSWORD',
      message: 'Default Password (will be base64 encoded):',
      initial: getDef('PASSWORD'),
    },
    {
      type: 'select',
      name: 'SHOW',
      message: 'Show browser GUI during run?',
      choices: ['0 (No, Headless)', '1 (Yes, Show GUI)'],
      initial: getDef('SHOW') === '1' ? 1 : 0,
      result(val) {
        return val.startsWith('1') ? '1' : '0';
      },
    },
    {
      type: 'input',
      name: 'EG_EMAIL',
      message: 'Epic Games Email (leave blank to use Default Email):',
      initial: getDef('EG_EMAIL'),
    },
    {
      type: 'password',
      name: 'EG_PASSWORD',
      message: 'Epic Games Password (leave blank to use Default Password):',
      initial: getDef('EG_PASSWORD'),
    },
    {
      type: 'input',
      name: 'EG_OTPKEY',
      message: 'Epic Games OTP Key (for 2FA):',
      initial: getDef('EG_OTPKEY'),
    },
    {
      type: 'input',
      name: 'PG_EMAIL',
      message: 'Prime Gaming Email (leave blank to use Default Email):',
      initial: getDef('PG_EMAIL'),
    },
    {
      type: 'password',
      name: 'PG_PASSWORD',
      message: 'Prime Gaming Password (leave blank to use Default Password):',
      initial: getDef('PG_PASSWORD'),
    },
    {
      type: 'input',
      name: 'PG_OTPKEY',
      message: 'Prime Gaming OTP Key (for 2FA):',
      initial: getDef('PG_OTPKEY'),
    },
    {
      type: 'select',
      name: 'PG_REDEEM',
      message: 'Prime Gaming: Attempt to auto-redeem keys on external stores?',
      choices: ['0 (No)', '1 (Yes)'],
      initial: getDef('PG_REDEEM') === '1' ? 1 : 0,
      result(val) {
        return val.startsWith('1') ? '1' : '0';
      },
    },
    {
      type: 'input',
      name: 'GOG_EMAIL',
      message: 'GOG Email (leave blank to use Default Email):',
      initial: getDef('GOG_EMAIL'),
    },
    {
      type: 'password',
      name: 'GOG_PASSWORD',
      message: 'GOG Password (leave blank to use Default Password):',
      initial: getDef('GOG_PASSWORD'),
    },
  ]);

  let configContent = '';
  // First save prompted variables
  const promptedKeys = Object.keys(response);
  for (const [key, value] of Object.entries(response)) {
    if (value) {
      if (key.includes('PASSWORD')) {
        configContent += `${key}=${encodeBase64(value)}\n`;
      } else {
        configContent += `${key}=${value}\n`;
      }
    }
  }

  // Preserve other existing configs not prompted here
  for (const [key, value] of Object.entries(existingConfig)) {
    if (!promptedKeys.includes(key) && value) {
      configContent += `${key}=${value}\n`;
    }
  }

  // Create data dir if not exists
  await fs.promises.mkdir(dataDir(''), { recursive: true });
  await fs.promises.writeFile(configPath, configContent);
  console.log(`\nConfiguration successfully saved to ${configPath}`);
}

const args = process.argv.slice(2);
if (args[0] === 'config') {
  runConfig().catch(console.error);
} else {
  console.log('Usage: node fgc.js config');
}
