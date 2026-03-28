import fs from 'fs-extra';
import Handlebars from 'handlebars';
import { PACKAGE_MANAGERS, PackageManager, Preset, PRESETS } from './types.js';

export function resolvePreset(value?: string): Preset | undefined {
  if (!value) return undefined;
  if (PRESETS.includes(value as Preset)) return value as Preset;
  console.error(`Unknown preset "${value}". Valid options: ${PRESETS.join(', ')}`);
  process.exit(1);
}

export function resolvePm(value?: string): PackageManager | undefined {
  if (!value) return undefined;
  if (PACKAGE_MANAGERS.includes(value as PackageManager)) return value as PackageManager;
  console.error(
    `Unknown package manager "${value}". Valid options: ${PACKAGE_MANAGERS.join(', ')}`,
  );
  process.exit(1);
}

export async function generate(templatePath: string, targetPath: string, data: any) {
  const template = await fs.readFile(templatePath, 'utf-8');
  const compiled = Handlebars.compile(template);

  const result = compiled(data);

  await fs.outputFile(targetPath, result);
}
