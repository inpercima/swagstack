export const DESIGN_SYSTEMS = {
  NONE: 'none',
  TAILWIND_CSS: 'tailwind-css',
  DAISYUI: 'daisyui',
  SHADCN_UI: 'shadcn-ui',
  BOOTSTRAP: 'bootstrap',
  CLARITY_DESIGN: 'clarity-design',
  ANGULAR_MATERIAL: 'angular-material',
} as const;

export type DesignSystem = (typeof DESIGN_SYSTEMS)[keyof typeof DESIGN_SYSTEMS];

export const PACKAGE_MANAGERS = {
  PNPM: 'pnpm',
  NPM: 'npm',
  YARN: 'yarn',
} as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[keyof typeof PACKAGE_MANAGERS];

export const PRESETS = {
  ANGULAR_ONLY: 'preset-angular-only',
  ANGULAR_JAVA: 'preset-angular-java',
  ANGULAR_PHP: 'preset-angular-php',
  ANGULAR_NESTJS: 'preset-angular-nestjs',
} as const;
export type Preset = (typeof PRESETS)[keyof typeof PRESETS];

export interface InitOptions {
  name?: string;
  preset?: string;
  pm?: string;
  designSystem?: string;
  useCypress?: boolean;
  useCI?: boolean;
  useAngularMaterial?: boolean;
}

export interface Config {
  repoRoot: string;
  projectName: string;
  preset: Preset;
  pm: PackageManager;
  designSystem: DesignSystem[];
  useCypress: boolean;
  useCI: boolean;
}
