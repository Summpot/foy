import { defineConfig } from '@rslib/core'

export default defineConfig({
  lib: [

    { dts: true, format: 'esm', syntax: 'es2021' },
    { dts: true, format: 'cjs', syntax: 'es2021' },
  ],
})
