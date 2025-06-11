import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['main/index.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: false,
  format: ['cjs'],
  external: [],
  target: 'node16',
  noExternal: [],
})
