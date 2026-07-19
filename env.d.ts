/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_SERVER: string
  readonly VITE_DATA_SERVER: string
  readonly VITE_API_PASSWORD: string
  readonly VITE_USE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
