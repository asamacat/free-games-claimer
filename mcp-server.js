import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import { dataDir } from './src/util.js';

const execPromise = util.promisify(exec);

const server = new Server(
  {
    name: 'free-games-claimer-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'run_claimer',
        description: 'Run the auto-claimer script for a specific store (epic-games, prime-gaming, or gog).',
        inputSchema: {
          type: 'object',
          properties: {
            store: {
              type: 'string',
              description: 'The store to claim games for. Must be \'epic-games\', \'prime-gaming\', or \'gog\'.',
              enum: ['epic-games', 'prime-gaming', 'gog'],
            },
          },
          required: ['store'],
        },
      },
      {
        name: 'get_claimed_games',
        description: 'Get the list of successfully claimed games from a specific store.',
        inputSchema: {
          type: 'object',
          properties: {
            store: {
              type: 'string',
              description: 'The store to check data for. Must be \'epic-games\', \'prime-gaming\', or \'gog\'.',
              enum: ['epic-games', 'prime-gaming', 'gog'],
            },
          },
          required: ['store'],
        },
      },
      {
        name: 'update_config',
        description: 'Update a configuration setting (e.g. EMAIL, PASSWORD, etc.).',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'The configuration key to update (e.g., EMAIL, SHOW, PG_REDEEM).',
            },
            value: {
              type: 'string',
              description: 'The value to set.',
            },
          },
          required: ['key', 'value'],
        },
      },
    ],
  };
});

function encodeBase64(str) {
  if (!str) return '';
  return Buffer.from(str).toString('base64');
}

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  if (name === 'run_claimer') {
    const store = args.store;
    if (!['epic-games', 'prime-gaming', 'gog'].includes(store)) {
      return {
        content: [{ type: 'text', text: 'Invalid store. Must be epic-games, prime-gaming, or gog.' }],
        isError: true,
      };
    }

    try {
      // Return a message that it started, as it could take a while
      // Note: Ideally we await it, but MCP has timeouts. Let's just run it synchronously for simplicity.
      const { stdout, stderr } = await execPromise(`node ${store}.js`);
      return {
        content: [
          { type: 'text', text: `Successfully ran ${store} claimer.\nOutput:\n${stdout}\nErrors:\n${stderr}` },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error running claimer for ${store}: ${error.message}\n${error.stdout || ''}` }],
        isError: true,
      };
    }
  }

  if (name === 'get_claimed_games') {
    const store = args.store;
    if (!['epic-games', 'prime-gaming', 'gog'].includes(store)) {
      return {
        content: [{ type: 'text', text: 'Invalid store. Must be epic-games, prime-gaming, or gog.' }],
        isError: true,
      };
    }

    const dataFile = dataDir(`${store}.json`);
    if (!fs.existsSync(dataFile)) {
      return {
        content: [{ type: 'text', text: `No data file found for ${store} at ${dataFile}. Have you run the script yet?` }],
      };
    }

    try {
      const data = fs.readFileSync(dataFile, 'utf8');
      return {
        content: [{ type: 'text', text: data }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error reading data file: ${error.message}` }],
        isError: true,
      };
    }
  }

  if (name === 'update_config') {
    const key = args.key;
    const value = args.value;
    const configPath = dataDir('config.env');

    const existingConfig = {};
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      raw.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          existingConfig[parts[0].trim()] = parts.slice(1).join('=').trim();
        }
      });
    }

    // Process base64 if it's a password
    if (key.includes('PASSWORD')) {
      existingConfig[key] = encodeBase64(value);
    } else {
      existingConfig[key] = value;
    }

    let configContent = '';
    for (const [k, v] of Object.entries(existingConfig)) {
      if (v) {
        configContent += `${k}=${v}\n`;
      }
    }

    fs.mkdirSync(dataDir(''), { recursive: true });
    fs.writeFileSync(configPath, configContent);

    return {
      content: [{ type: 'text', text: `Successfully updated ${key} in config.` }],
    };
  }

  return {
    content: [{ type: 'text', text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Free Games Claimer MCP Server running on stdio');
}

main().catch(error => {
  console.error('Server error:', error);
  process.exit(1);
});
