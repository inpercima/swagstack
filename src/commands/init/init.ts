import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  askContinueInNonEmptyDir,
  askProjectName,
  askUseCI,
  askUseCypress,
  chooseDesignSystem,
  choosePackageManager,
  choosePreset,
} from '../../utils/prompts.js';
import {
  Config,
  DESIGN_SYSTEMS,
  DesignSystem,
  PACKAGE_MANAGERS,
  PRESETS,
  type InitOptions,
  type PackageManager,
  type Preset,
} from '../../utils/types.js';
import { createAngularFrontendSkeleton } from './init-angular/init-angular.js';

/**
 *  Ensures that the target directory exists and is empty.
 *  If the directory already exists and is not empty, prompts the user to confirm whether to continue.
 *  Preserves .git directory if it exists, while removing all other files and directories.
 *  Returns true if the directory is ready for use, false if the user aborted.
 **/
async function ensureCleanEmptyDir(dir: string): Promise<boolean> {
  await fs.ensureDir(dir);

  const entries = await fs.readdir(dir);
  if (entries.length === 0) {
    return true;
  }

  const ok = await askContinueInNonEmptyDir(dir);
  if (!ok) {
    console.log('❌ ' + chalk.red('Aborted.'));
    return false;
  }

  // Remove all entries except .git
  for (const entry of entries) {
    if (entry !== '.git') {
      await fs.remove(path.join(dir, entry));
    }
  }

  return true;
}

/** Logs the starting info for the initialization process. */
function logStarting(repoRoot: string, preset: Preset, pm: PackageManager): void {
  console.log('');
  console.log('🚀 ' + chalk.cyanBright('Starting swagstack project initialization...'));
  console.log('');
  console.log(`Creating monorepo: ${chalk.green(repoRoot)}`);
  console.log(`Preset:            ${chalk.green(preset)}`);
  console.log(`Package Manager:   ${chalk.green(pm)}`);
  console.log('');
}

/** Writes the root-level files like package.json and README.md. */
async function writeRootFiles(repoRoot: string): Promise<void> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return fs.copyFile(
    path.join(__dirname, '../../templates/root/.gitattributes'),
    path.join(repoRoot, '.gitattributes'),
  );
  // const rootPkg = {
  //   name: projectName,
  //   private: true,
  //   workspaces: ['apps/*'],
  //   scripts: {
  //     'dev:frontend': `${pm} --prefix apps/frontend start`,
  //   },
  // };
  // await fs.writeJson(path.join(repoRoot, 'package.json'), rootPkg, { spaces: 2 });
  // if (pm === 'pnpm') {
  //   await fs.writeFile(path.join(repoRoot, 'pnpm-workspace.yaml'), `packages:\n  - 'apps/*'\n`);
  // }
  // await fs.writeFile(
  //   path.join(repoRoot, 'README.md'),
  //   [
  //     `# ${projectName}`,
  //     '',
  //     'Generated with [swagstack](https://github.com/inpercima/swagstack).',
  //     '',
  //     '## Next steps',
  //     '',
  //     `\`\`\`bash`,
  //     `cd ${projectName}`,
  //     `${pm} install`,
  //     `${pm} run dev:frontend`,
  //     `\`\`\``,
  //     '',
  //   ].join('\n'),
  // );
}

async function createJavaBackendSkeleton(repoRoot: string): Promise<void> {
  const backendDir = path.join(repoRoot, 'apps', 'backend');
  await fs.ensureDir(backendDir);
  await fs.writeFile(
    path.join(backendDir, 'README.md'),
    [
      '# backend (Java / Spring Boot)',
      '',
      'TODO: Spring Boot initializer integration coming in a future release.',
      '',
      '## Placeholder',
      '',
      'Add your Java/Spring Boot project here.',
      '',
    ].join('\n'),
  );
}

async function createPhpBackendSkeleton(repoRoot: string): Promise<void> {
  const backendDir = path.join(repoRoot, 'apps', 'backend');
  const publicDir = path.join(backendDir, 'public');
  await fs.ensureDir(publicDir);
  await fs.writeFile(
    path.join(publicDir, 'index.php'),
    [
      '<?php',
      "header('Content-Type: application/json');",
      "echo json_encode(['status' => 'ok']);",
      '',
    ].join('\n'),
  );
  await fs.writeFile(
    path.join(backendDir, 'README.md'),
    [
      '# backend (PHP)',
      '',
      'A minimal PHP backend skeleton.',
      '',
      '## Getting started',
      '',
      'Run with any PHP-capable server (e.g. `php -S localhost:8080 -t public`).',
      '',
    ].join('\n'),
  );
}

async function startInitialization(config: Config): Promise<void> {
  logStarting(config.repoRoot, config.preset, config.pm);

  await writeRootFiles(config.repoRoot);
  await createAngularFrontendSkeleton(config);

  // if (config.preset === PRESETS.ANGULAR_JAVA) {
  //   await createJavaBackendSkeleton(config.repoRoot);
  // } else if (config.preset === PRESETS.ANGULAR_PHP) {
  //   await createPhpBackendSkeleton(config.repoRoot);
  // }

  console.log('');
  console.log(`✔ ${chalk.green('Done! Next steps:')}`);
  console.log('');
  console.log(`  cd ${chalk.green(config.projectName)}`);
  console.log(`  ${chalk.green(config.pm)} install`);
  console.log(`  ${chalk.green(config.pm)} run dev:frontend`);
  console.log('');
}

export function resolvePreset(value?: string): Preset | undefined {
  const validPresets = Object.values(PRESETS);
  if (!value) {
    return undefined;
  }
  if ((validPresets as string[]).includes(value)) {
    return value as Preset;
  }
  console.error(`Unknown preset "${value}". Valid options: ${validPresets.join(', ')}`);
  process.exit(1);
}

export function resolvePm(value?: string): PackageManager | undefined {
  const validPms = Object.values(PACKAGE_MANAGERS);
  if (!value) {
    return undefined;
  }
  if ((validPms as string[]).includes(value)) {
    return value as PackageManager;
  }

  console.error(`Unknown package manager "${value}". Valid options: ${validPms.join(', ')}`);
  process.exit(1);
}

export function resolveDesignSystems(value?: string): DesignSystem[] | undefined {
  if (!value) {
    return undefined;
  }
  const input = value.split(',').map((v) => v.trim());
  const valid = Object.values(DESIGN_SYSTEMS);
  const invalid = input.filter((v) => !valid.includes(v as DesignSystem));

  if (invalid.length > 0) {
    console.error(
      `Unknown design system(s): ${invalid.join(', ')}.\nValid options: ${valid.join(', ')}`,
    );
    process.exit(1);
  }

  return input as DesignSystem[];
}

export function initCommand(): Command {
  const cmd = new Command('init');
  cmd
    .argument('[name]', 'Project folder name (monorepo root)')
    .option('--preset <preset>', 'Preset to use (e.g. preset-angular-only)')
    .option('--pm <packageManager>', 'pnpm | npm | yarn (default: pnpm)')
    .option('--ds <designSystem>', 'Design system to use (e.g. Tailwind CSS)')
    .option('--cy', 'Include Cypress for end-to-end testing')
    .option('--ci', 'Use CI/CD setup')
    .action(async (name: string | undefined, opts: InitOptions) => {
      const config: Config = {
        projectName: name ?? (await askProjectName()),
        repoRoot: '', // will be set later after resolving the project name
        preset: resolvePreset(opts.preset) ?? (await choosePreset()),
        pm: resolvePm(opts.pm) ?? (await choosePackageManager()),
        designSystem: resolveDesignSystems(opts.designSystem) ?? (await chooseDesignSystem()),
        useCypress: opts.useCypress ?? (await askUseCypress()),
        useCI: opts.useCI ?? (await askUseCI()),
      };

      config.repoRoot = path.resolve(process.cwd(), config.projectName);

      if (await ensureCleanEmptyDir(config.repoRoot)) {
        startInitialization(config).catch((err) => {
          console.error('Initialization failed:', err);
          process.exit(1);
        });
      } else {
        return;
      }
    });

  return cmd;
}
