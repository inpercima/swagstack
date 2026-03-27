import { confirm } from '@inquirer/prompts';
import { Command } from 'commander';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'node:path';
import { askProjectName, choosePackageManager, choosePreset } from './prompts.js';
import type { InitOptions, PackageManager, Preset } from './types.js';
import { resolvePm, resolvePreset } from './utils.js';

async function run(cmd: string, args: string[], cwd: string): Promise<void> {
  await execa(cmd, args, { cwd, stdio: 'inherit' });
}

async function ensureEmptyOrForce(dir: string, force: boolean): Promise<void> {
  const exists = await fs.pathExists(dir);
  if (!exists) return;
  const entries = await fs.readdir(dir);
  if (entries.length === 0) return;
  if (!force) {
    throw new Error(`Target directory is not empty: ${dir}\nUse --force to overwrite.`);
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
    await fs.writeFile(path.join(repoRoot, 'pnpm-workspace.yaml'), `packages:\n  - 'apps/*'\n`);
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
    .option('--preset <preset>', 'preset-angular-only | preset-angular-java | preset-angular-php')
    .option('--pm <pm>', 'pnpm | npm | yarn (default: pnpm)')
    .action(async (name: string | undefined, opts: InitOptions) => {
      const projectName = name ?? (await askProjectName());
      const preset: Preset = resolvePreset(opts.preset) ?? (await choosePreset());
      const pm: PackageManager = resolvePm(opts.pm) ?? (await choosePackageManager());

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
