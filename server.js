import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runScript(name) {
  console.log(`[${new Date().toISOString()}] Running ${name}...`);
  try {
    const { stdout, stderr } = await execPromise(`node ${name}`);
    if (stdout) console.log(`[${name}] stdout: ${stdout}`);
    if (stderr) console.error(`[${name}] stderr: ${stderr}`);
  } catch (error) {
    console.error(`[${name}] Error: ${error.message}`);
  }
}

async function runAll() {
  console.log(`\n[${new Date().toISOString()}] Starting daily run...`);
  await runScript('epic-games.js');
  await runScript('prime-gaming.js');
  await runScript('gog.js');
  console.log(`[${new Date().toISOString()}] Finished daily run.`);
}

async function startServer() {
  console.log('--- Free Games Claimer Server Mode ---');
  console.log('Scripts will be executed immediately, and then once every 24 hours.');

  // Run immediately on start
  await runAll();

  // Run every 24 hours (24 * 60 * 60 * 1000 ms)
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  setInterval(runAll, ONE_DAY_MS);
}

startServer();
