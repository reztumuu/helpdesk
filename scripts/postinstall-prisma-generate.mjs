import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const isWin = process.platform === 'win32';
const prismaCli = resolve(
  process.cwd(),
  'node_modules',
  '.bin',
  isWin ? 'prisma.cmd' : 'prisma'
);

try {
  spawnSync(prismaCli, ['generate'], {
    stdio: 'ignore',
    env: { ...process.env, PRISMA_HIDE_POSTINSTALL_PROMPT: '1' },
  });
} catch {}

