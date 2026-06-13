/// <reference types="vite/client" />

interface Window {
  ethereum?: any;
  bootstrap?: any;
  Splide?: any;
}

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
