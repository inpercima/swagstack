import { checkbox, confirm, input, select } from '@inquirer/prompts';
import {
  DESIGN_SYSTEMS,
  DesignSystem,
  PACKAGE_MANAGERS,
  PackageManager,
  Preset,
  PRESETS,
} from './types.js';

/** Prompts the user to enter a project name. */
export function askProjectName(): Promise<string> {
  return input({ message: 'Project name (folder):', default: 'my-app' });
}

/** Prompts the user to choose a preset. */
export function choosePreset(): Promise<Preset> {
  return select<Preset>({
    message: 'Choose a preset',
    choices: [
      {
        name: 'Angular only',
        value: PRESETS.ANGULAR_ONLY,
      },
      {
        name: 'Angular + Java',
        value: PRESETS.ANGULAR_JAVA,
      },
      {
        name: 'Angular + PHP',
        value: PRESETS.ANGULAR_PHP,
      },
      {
        name: 'Angular + Nest.js',
        value: PRESETS.ANGULAR_NESTJS,
      },
    ],
  });
}

/** Prompts the user to choose a package manager. */
export function choosePackageManager(): Promise<PackageManager> {
  return select<PackageManager>({
    message: 'Choose a package manager',
    choices: [
      { name: `${PACKAGE_MANAGERS.PNPM} (recommended)`, value: PACKAGE_MANAGERS.PNPM },
      { name: PACKAGE_MANAGERS.NPM, value: PACKAGE_MANAGERS.NPM },
      { name: PACKAGE_MANAGERS.YARN, value: PACKAGE_MANAGERS.YARN },
    ],
  });
}

export function chooseDesignSystem(): Promise<DesignSystem[]> {
  return checkbox<DesignSystem>({
    message: 'Choose a design system (you can select multiple)',
    choices: [
      { name: 'None', value: DESIGN_SYSTEMS.NONE },
      { name: 'Tailwind CSS', value: DESIGN_SYSTEMS.TAILWIND_CSS },
      { name: 'DaisyUI', value: DESIGN_SYSTEMS.DAISYUI },
      { name: 'ShadCN UI', value: DESIGN_SYSTEMS.SHADCN_UI },
      { name: 'Bootstrap', value: DESIGN_SYSTEMS.BOOTSTRAP },
      { name: 'Clarity Design', value: DESIGN_SYSTEMS.CLARITY_DESIGN },
      { name: 'Angular Material', value: DESIGN_SYSTEMS.ANGULAR_MATERIAL },
    ],
  });
}

/** Prompts the user to confirm whether to continue when the target directory already exists and is not empty. */
export function askContinueInNonEmptyDir(dirName: string): Promise<boolean> {
  return confirm({
    message: `Directory "${dirName}" already exists and is not empty. Continue anyway?`,
    default: false,
  });
}

export function askUseCypress(): Promise<boolean> {
  return confirm({
    message: 'Do you want to include Cypress for end-to-end testing?',
    default: true,
  });
}

export function askUseCI(): Promise<boolean> {
  return confirm({
    message: 'Do you want to set up GitHub Actions CI workflow?',
    default: true,
  });
}
