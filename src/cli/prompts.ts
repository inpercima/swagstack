import { input, select } from '@inquirer/prompts';
import { PackageManager, Preset } from './types.js';

/** Prompts the user to enter a project name. */
export function askProjectName(): Promise<string> {
  return input({ message: 'Project name (folder):', default: 'my-app' });
}

/** Prompts the user to choose a preset. */
export function choosePreset(): Promise<Preset> {
  return select<Preset>({
    message: 'Choose a preset',
    choices: [
      {
        name: 'Angular only',
        value: 'preset-angular-only',
      },
      {
        name: 'Angular + Java',
        value: 'preset-angular-java',
      },
      {
        name: 'Angular + PHP',
        value: 'preset-angular-php',
      },
      {
        name: 'Angular + Nest.js',
        value: 'preset-angular-nestjs',
      },
    ],
  });
}

/** Prompts the user to choose a package manager. */
export function choosePackageManager(): Promise<PackageManager> {
  return select<PackageManager>({
    message: 'Choose a package manager',
    choices: [
      { name: 'pnpm  (recommended)', value: 'pnpm' },
      { name: 'npm', value: 'npm' },
      { name: 'yarn', value: 'yarn' },
    ],
  });
}
