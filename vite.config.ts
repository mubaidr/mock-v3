import { crx } from '@crxjs/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { dirname, join, relative, resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import manifest from './manifest.config'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(join(__dirname, 'src')),
      src: resolve(join(__dirname, 'src')),
    },
  },
  plugins: [
    crx({ manifest }),

    vue(),

    Pages({
      dirs: [
        {
          dir: 'src/pages',
          baseRoute: '',
        },
        {
          dir: 'src/options/pages',
          baseRoute: 'options',
        },
        {
          dir: 'src/popup/pages',
          baseRoute: 'popup',
        },
        {
          dir: 'src/content-script/iframe/pages',
          baseRoute: 'iframe',
        },
      ],
    }),

    AutoImport({
      imports: ['vue', 'vue-router', 'vue/macros', '@vueuse/core'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables/'],
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      dirs: ['src/components'],
      // generate `components.d.ts` for ts support with Volar
      dts: 'src/components.d.ts',
      resolvers: [
        // auto import icons
        IconsResolver({
          prefix: 'i',
          enabledCollections: ['mdi'],
        }),
      ],
    }),

    // https://github.com/antfu/unplugin-icons
    Icons({
      autoInstall: true,
      compiler: 'vue3',
    }),

    // rewrite assets to use relative path
    {
      name: 'assets-rewrite',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml(html, { path }) {
        return html.replace(
          /"\/assets\//g,
          `"${relative(dirname(path), '/assets')}/`
        )
      },
    },
    // Add the TypeScript plugin
    // typescript({
    //   tsconfig: 'tsconfig.json', // Adjust the path to your tsconfig.json if needed
    //   clean: true,
    //   tsconfigOverride: {
    //     include: ['src/content-script/inject.ts'],
    //   },
    // }),
    // alias({
    //   entries: {
    //     // Map the input path to the desired output path
    //     // Update this path according to your project structure
    //     'src/content-script/inject.ts': 'src/content-script/inject.ts',
    //   },
    // }),
  ],
  build: {
    // rollupOptions: {
    //   input: {
    //     iframe: 'src/content-script/iframe/index.html',
    //     inject: 'src/content-script/inject.ts',
    //   },
    // },
    rollupOptions: {
      // input: {
      //   iframe: 'src/content-script/iframe/index.html',
      //   inject: 'src/content-script/inject.ts', // Keep .ts extension
      // },
      // // Specify the output options
      // output: {
      //   dir: 'dist/src/inject', // Set the output directory
      //   entryFileNames: '[name]/index.js', // Set the output file name pattern
      // },
      input: {
        iframe: 'src/content-script/iframe/index.html',
        // Use the new alias path for inject.ts
        // inject: 'src/content-script/inject.ts',
      },
      // Specify the output options
      output: {
        dir: 'dist', // Set the main output directory
        // entryFileNames: 'src/inject/index.js', // Set the desired output file name
      },
    },
  },
  server: {
    port: 8888,
    strictPort: true,
    hmr: {
      port: 8889,
      overlay: false,
    },
  },
  optimizeDeps: {
    include: ['vue', '@vueuse/core'],
    exclude: ['vue-demi'],
  },
})
