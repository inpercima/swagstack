import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const source = path.resolve(__dirname, '../src/templates');
const target = path.resolve(__dirname, '../dist/templates');

await fs.ensureDir(path.dirname(target));
await fs.copy(source, target, { overwrite: true });

console.log(`Copied templates: ${source} -> ${target}`);
