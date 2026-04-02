import path from 'node:path';
import { PRESETS, Config, DESIGN_SYSTEMS } from '../../../utils/types.js';
import { run } from '../../../utils/utils.js';
import { ANGULAR_CLI_VERSION, CLARITY_DESIGN_VERSION } from '../../../utils/versions.js';

export async function createAngularFrontendSkeleton(config: Config): Promise<void> {
  const isAngularOnly = config.preset === PRESETS.ANGULAR_ONLY;
  const workingRootDir = isAngularOnly ? process.cwd() : config.repoRoot;
  const workingAngularDir = isAngularOnly ? config.repoRoot : path.join(config.repoRoot, 'frontend');

  await installAngularCli(workingRootDir, isAngularOnly, config.pm, config.projectName);

  await run('ng', ['add', 'angular-eslint'], workingAngularDir);

  if (config.useCypress) {
    await run('ng', ['add', '@cypress/schematic'], workingAngularDir);
  }

  if (config.designSystem.includes(DESIGN_SYSTEMS.ANGULAR_MATERIAL)) {
    await run('ng', ['add', `@angular/material@${ANGULAR_CLI_VERSION}`], workingAngularDir);
  }

  if (config.designSystem.includes(DESIGN_SYSTEMS.CLARITY_DESIGN)) {
    await run(config.pm, ['install', `@clr/ui@${CLARITY_DESIGN_VERSION}`, `@clr/angular@${CLARITY_DESIGN_VERSION}`], workingAngularDir);
  }
}

async function installAngularCli(workingRootDir: string, isAngularOnly: boolean, pm: string, projectName: string): Promise<void> {
  return run(
    'npx',
    [
      '-y',
      `@angular/cli@${ANGULAR_CLI_VERSION}`,
      'new',
      isAngularOnly ? projectName : 'frontend',
      '--interactive=false',
      '--skip-git',
      '--style=css',
      '--routing',
      '--package-manager',
      pm,
    ],
    workingRootDir,
  );
}
