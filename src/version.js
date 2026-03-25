// check if running the latest version

import { log } from 'console';
import { exec } from 'child_process';

const execp = cmd => new Promise((resolve, reject) => {
  exec(cmd, (error, stdout, stderr) => {
    if (stderr) console.error(`stderr: ${stderr}`);
    if (error) {
      console.log(`error: ${error.message}`);
      if (error.message.includes('command not found')) {
        console.info('Install git to check for updates!');
      }
      return reject(error);
    }
    resolve(stdout.trim());
  });
});

let sha, date;
if (process.env.NOVNC_PORT) {
  log('Running inside Docker.');
  ['COMMIT', 'BRANCH', 'NOW'].forEach(v => log(`  ${v}:`, process.env[v]));
  sha = process.env.COMMIT;
  date = process.env.NOW;
} else {
  log('Not running inside Docker.');
  sha = await execp('git rev-parse HEAD');
  date = await execp('git show -s --format=%cD'); // same as format as `date -R` (RFC2822)
}

const gh = await (await fetch('https://api.github.com/repos/vogler/free-games-claimer/commits/main', {
})).json();

log('Local commit:', sha, new Date(date));
log('Online commit:', gh.sha, new Date(gh.commit.committer.date));

if (sha == gh.sha) {
  log('Running the latest version!');
} else {
  log('Not running the latest version!');
}
