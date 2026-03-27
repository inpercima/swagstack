export const PRESETS = [
  'preset-angular-only',
  'preset-angular-java',
  'preset-angular-php',
  'preset-angular-nestjs',
] as const;
export type Preset = (typeof PRESETS)[number];

export const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn'] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export interface InitOptions {
  preset?: string;
  pm?: string;
}
