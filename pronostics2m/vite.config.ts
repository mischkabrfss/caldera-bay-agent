import { cloudflare } from '@cloudflare/vite-plugin';
import vinext from 'vinext';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  // Keep Wrangler and Miniflare state project-local.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  return {
    plugins: [
      vinext(),
      cloudflare({
        inspectorPort: false,
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
      }),
    ],
  };
});
