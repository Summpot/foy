import { defineConfig } from '@rslib/core'

export default defineConfig({
  lib: [
    {
      dts: true, bundle: false, format: 'esm', syntax: 'es2021', source: { include: ["./src/*.ts"] }
    },
    { dts: true, bundle: false, format: 'cjs', syntax: 'es2021', source: { include: ["./src/*.ts"] } },
  ],
})
