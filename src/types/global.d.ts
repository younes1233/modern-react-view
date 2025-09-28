// Global type declarations for temporary build fixes

declare global {
  interface Window {
    // Add any window extensions here
  }
}

// Extend existing interfaces temporarily
declare module "*.tsx" {
  const component: any;
  export default component;
}

declare module "*.ts" {
  const module: any;
  export = module;
  export default module;
}

// Allow any for temporary fixes
declare var __DEV__: boolean;

export {};