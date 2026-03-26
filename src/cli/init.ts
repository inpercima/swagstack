import path from 'node:path';
import fs from 'fs-extra';
import { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { execa } from 'execa';
import type { Preset, PackageManager, InitOptions } from './types.js';

const VALID_PRESETS: Preset[] = ['preset-angular-only', 'preset-angular-java', 'preset-angular-php'];
const VALID_PMS: PackageManager[] = ['pnpm', 'npm', 'yarn'];

function resolvePreset(value?: string): Preset | undefined {
  if (!value) return undefined;
  if (VALID_PRESETS.includes(value as Preset)) return value as Preset;
  console.error(`Unknown preset "${value}". Valid options: ${VALID_PRESETS.join(', ')}`);
  process.exit(1);
}

function resolvePm(value?: string): PackageManager | undefined {
  if (!value) return undefined;
  if (VALID_PMS.includes(value as PackageManager)) return value as PackageManager;
  console.error(`Unknown package manager "${value}". Valid options: ${VALID_PMS.join(', ')}`);
  process.exit(1);
}

async function run(cmd: string, args: string[], cwd: string): Promise<void> {
  await execa(cmd, args, { cwd, stdio: 'inherit' });
}

async function ensureEmptyOrForce(dir: string, force: boolean): Promise<void> {
  const exists = await fs.pathExists(dir);
  if (!exists) return;
  const entries = await fs.readdir(dir);
  if (entries.length === 0) return;
  if (!force) {
    throw new Error(
      `Target directory is not empty: ${dir}\nUse --force to overwrite.`,
    );
  }
  await fs.emptyDir(dir);
}

async function writeRootFiles(repoRoot: string, pm: PackageManager): Promise<void> {
  const name = path.basename(repoRoot);
  const rootPkg = {
    name,
    private: true,
    workspaces: ['apps/*'],
    scripts: {
      'dev:frontend': `${pm} --prefix apps/frontend start`,
    },
  };
  await fs.writeJson(path.join(repoRoot, 'package.json'), rootPkg, { spaces: 2 });

  if (pm === 'pnpm') {
    await fs.writeFile(
      path.join(repoRoot, 'pnpm-workspace.yaml'),
      `packages:\n  - 'apps/*'\n`,
    );
  }

  await fs.writeFile(
    path.join(repoRoot, 'README.md'),
    [
      `# ${name}`,
      '',
      'Generated with [swaaplate](https://github.com/inpercima/swaaplate).',
      '',
      '## Next steps',
      '',
      `\`\`\`bash`,
      `cd ${name}`,
      `${pm} install`,
      `${pm} run dev:frontend`,
      `\`\`\``,
      '',
    ].join('\n'),
  );
}

async function createAngularFrontend(repoRoot: string, pm: PackageManager): Promise<void> {
  const appsDir = path.join(repoRoot, 'apps');
  const frontendDir = path.join(appsDir, 'frontend');
  await fs.ensureDir(appsDir);

  await run(
    'npx',
    [
      '-y',
      '@angular/cli@latest',
      'new',
      'frontend',
      '--directory',
      frontendDir,
      '--package-manager',
      pm,
      '--skip-git',
      '--skip-tests',
    ],
    repoRoot,
  );
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

export function initCommand(): Command {
  const cmd = new Command('init');

  cmd
    .argument('[name]', 'Project folder name (monorepo root)')
    .option(
      '--preset <preset>',
      'preset-angular-only | preset-angular-java | preset-angular-php',
    )
    .option('--pm <pm>', 'pnpm | npm | yarn (default: pnpm)')
    .option('-y, --yes', 'skip prompts where possible', false)
    .option('-f, --force', 'overwrite existing non-empty target directory', false)
    .action(async (name: string | undefined, opts: InitOptions) => {
      const projectName =
        name ??
        (opts.yes
          ? 'my-app'
          : await input({ message: 'Project name (folder):', default: 'my-app' }));

      const preset: Preset =
        resolvePreset(opts.preset) ??
        (opts.yes
          ? 'preset-angular-only'
          : await select<Preset>({
              message: 'Choose a preset',
              choices: [
                {
                  name: 'Angular only                 (preset-angular-only)',
                  value: 'preset-angular-only',
                },
                {
                  name: 'Angular + Java backend        (preset-angular-java)',
                  value: 'preset-angular-java',
                },
                {
                  name: 'Angular + PHP backend         (preset-angular-php)',
                  value: 'preset-angular-php',
                },
              ],
            }));

      const pm: PackageManager =
        resolvePm(opts.pm) ??
        (opts.yes
          ? 'pnpm'
          : await select<PackageManager>({
              message: 'Package manager',
              choices: [
                { name: 'pnpm  (recommended)', value: 'pnpm' },
                { name: 'npm', value: 'npm' },
                { name: 'yarn', value: 'yarn' },
              ],
            }));

      const repoRoot = path.resolve(process.cwd(), projectName);

      if (!opts.force && (await fs.pathExists(repoRoot))) {
        const entries = await fs.readdir(repoRoot);
        if (entries.length > 0) {
          const ok = opts.yes
            ? false
            : await confirm({
                message: `Directory "${projectName}" already exists and is not empty. Continue anyway?`,
                default: false,
              });
          if (!ok) {
            console.log('Aborted.');
            return;
          }
        }
      }

      console.log('');
      console.log(`Creating monorepo: ${repoRoot}`);
      console.log(`  Preset : ${preset}`);
      console.log(`  PM     : ${pm}`);
      console.log('');

      await fs.ensureDir(repoRoot);
      await ensureEmptyOrForce(repoRoot, opts.force ?? false);
      await fs.ensureDir(path.join(repoRoot, 'apps'));

      await writeRootFiles(repoRoot, pm);
      await createAngularFrontend(repoRoot, pm);

      if (preset === 'preset-angular-java') {
        await createJavaBackendSkeleton(repoRoot);
      } else if (preset === 'preset-angular-php') {
        await createPhpBackendSkeleton(repoRoot);
      }

      console.log('');
      console.log('✔ Done! Next steps:');
      console.log('');
      console.log(`  cd ${projectName}`);
      console.log(`  ${pm} install`);
      console.log(`  ${pm} run dev:frontend`);
      console.log('');
    });

  return cmd;
}
