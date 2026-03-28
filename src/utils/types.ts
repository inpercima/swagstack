export const CSS_FRAMEWORKS = [
  'Tailwind CSS',
  'DaisyUI',
  'Bootstrap',
  'Shadcn UI',
] as const;
export type CssFramework = (typeof CSS_FRAMEWORKS)[number];

export const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn'] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export const PRESETS = [
  'preset-angular-only',
  'preset-angular-java',
  'preset-angular-php',
  'preset-angular-nestjs',
] as const;
export type Preset = (typeof PRESETS)[number];

export interface InitOptions {
  preset?: string;
  pm?: string;
}
