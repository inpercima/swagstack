export type Preset = 'preset-angular-only' | 'preset-angular-java' | 'preset-angular-php';
export type PackageManager = 'pnpm' | 'npm' | 'yarn';

export interface InitOptions {
  preset?: string;
  pm?: string;
  yes?: boolean;
  force?: boolean;
}
