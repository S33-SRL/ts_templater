import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  plugins: [
    typescript({
      declaration: true,
      declarationDir: './dist',
      rootDir: './src'
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TsTemplater',
      fileName: (format) => `ts-templater.${format}.js`
    },
    rollupOptions: {
      // Assicurati che le dipendenze esterne non siano incorporate nel bundle
      external: ['dayjs', 'bignumber.js'],
      output: {
        globals: {
          dayjs: 'dayjs',
          'bignumber.js': 'BigNumber'
        },
        exports: 'named' // Risolve il warning sul default export
      }
    }
  }
});