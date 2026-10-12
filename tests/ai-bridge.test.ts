// Run the same Edge provider/job tests under the installed Node runtime without
// downloading Deno or calling a paid API. npm: specifiers resolve to local deps.
import { registerHooks } from 'node:module';
import { test } from 'node:test';
registerHooks({
  resolve(specifier, context, nextResolve) {
    const packages: Record<string, string> = {
      'npm:zod@4.3.6': 'zod',
      'npm:astronomy-engine@2.1.19': 'astronomy-engine',
      'npm:music-metadata@12.1.0': 'music-metadata',
    };
    return nextResolve(packages[specifier] ?? specifier, context);
  },
});
(globalThis as unknown as { Deno: unknown }).Deno = {
  test,
  env: { get: (name: string) => process.env[name] },
};
require('../supabase/functions/_shared/ai/pipeline.test.ts');
