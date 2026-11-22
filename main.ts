import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repository = dirname(fileURLToPath(import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
if (output === repository || output.startsWith(repository + '/game')) throw new Error('Output must be separate from source.');
mkdirSync(output, { recursive: true });
for (const directory of ['game', 'screenshots']) cpSync(join(repository, directory), join(output, directory), { recursive: true });
const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(output, 'dossier.json'), dossier);
console.log('Vault Shift packaged: game/, screenshots/, dossier.json');
