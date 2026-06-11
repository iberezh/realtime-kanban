import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// SWC compiles decorators + emits decorator metadata, which esbuild (Vitest's default) cannot.
export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
        target: 'es2022',
      },
      module: { type: 'es6' },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
