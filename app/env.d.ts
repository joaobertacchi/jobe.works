/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public PostHog project key. Browser-visible; never a secret. */
  readonly VITE_POSTHOG_KEY?: string;
  /** PostHog ingestion host. Defaults to the US cloud. */
  readonly VITE_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
