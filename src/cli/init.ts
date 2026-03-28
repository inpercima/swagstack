import { Command } from 'commander';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'node:path';
import {
  askContinueInNonEmptyDir,
  askProjectName,
  choosePackageManager,
  choosePreset,
} from './prompts.js';
import type { InitOptions, PackageManager, Preset } from './types.js';
import { resolvePm, resolvePreset } from './utils.js';

/**
 *  Ensures that the target directory exists and is empty.
 *  If the directory already exists and is not empty, prompts the user to confirm whether to continue.
 *  Returns true if the directory is ready for use, false if the user aborted.
 **/
async function ensureCleanEmptyDir(dir: string, projectName: string): Promise<boolean> {
  if (await fs.pathExists(dir)) {
    const entries = await fs.readdir(dir);
    if (entries.length > 0) {
      const ok = await askContinueInNonEmptyDir(projectName);
      if (!ok) {
        console.log('Aborted.');
        return false;
      }
    }
  }
  await fs.emptyDir(dir);
  return true;
}

/** Logs the starting info for the initialization process. */
function logStarting(repoRoot: string, preset: Preset, pm: PackageManager): void {
  console.log('');
  console.log('🚀 Starting swagstack project initialization...');
  console.log('');
  console.log(`Creating monorepo: ${repoRoot}`);
  console.log(`Preset:            ${preset}`);
  console.log(`Package Manager:   ${pm}`);
  console.log('');
}

/** Runs a command in a child process, inheriting stdio. */
async function run(cmd: string, args: string[], cwd: string): Promise<void> {
  await execa(cmd, args, { cwd, stdio: 'inherit' });
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
    await fs.writeFile(path.join(repoRoot, 'pnpm-workspace.yaml'), `packages:\n  - 'apps/*'\n`);
  }

  await fs.writeFile(
    path.join(repoRoot, 'README.md'),
    [
      `# ${name}`,
      '',
      'Generated with [swagstack](https://github.com/inpercima/swagstack).',
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

/**
 * 
 * onst params = [
      '--interactive=false --skip-install=true --style=css',
      `--package-manager=${swHelper.isYarn() ? swProjectConst.YARN : swProjectConst.NPM}`,
      `--directory=${projectName}`,
      `--prefix=${frontendConfig.prefix}`,
      `--routing=${swHelper.isRouting()}`
    ];
 */

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

async function startInitialization(
  repoRoot: string,
  projectName: string,
  preset: Preset,
  pm: PackageManager,
): Promise<void> {
  logStarting(repoRoot, preset, pm);

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
}

export function initCommand(): Command {
  const cmd = new Command('init');
  cmd
    .argument('[name]', 'Project folder name (monorepo root)')
    .option('--preset <preset>', 'preset-angular-only | preset-angular-java | preset-angular-php')
    .option('--pm <pm>', 'pnpm | npm | yarn (default: pnpm)')
    .action(async (name: string | undefined, opts: InitOptions) => {
      const projectName = name ?? (await askProjectName());
      const preset: Preset = resolvePreset(opts.preset) ?? (await choosePreset());
      const pm: PackageManager = resolvePm(opts.pm) ?? (await choosePackageManager());

      const repoRoot = path.resolve(process.cwd(), projectName);

      if (await ensureCleanEmptyDir(repoRoot, projectName)) {
        startInitialization(repoRoot, projectName, preset, pm).catch((err) => {
          console.error('Initialization failed:', err);
          process.exit(1);
        });
      } else {
        return;
      }
    });

  return cmd;
}
