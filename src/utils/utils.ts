import { execa } from 'execa';
import fs from 'fs-extra';
import Handlebars from 'handlebars';

export async function generate(templatePath: string, targetPath: string, data: any) {
  const template = await fs.readFile(templatePath, 'utf-8');
  const compiled = Handlebars.compile(template);

  const result = compiled(data);

  await fs.outputFile(targetPath, result);
}

/** Runs a command in a child process, inheriting stdio. */
export async function run(cmd: string, args: string[], cwd: string): Promise<void> {
  await execa(cmd, args, { cwd, stdio: 'inherit' });
}
