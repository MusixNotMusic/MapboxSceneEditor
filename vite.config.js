import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import glsl from 'vite-plugin-glsl';

import { resolve } from 'path';

function pathResolve(dir) {
  return resolve(process.cwd(), '.', dir);
}

export default defineConfig({
  plugins: [vue(), glsl(
    {
      include: [              
        '**/*.glsl', '**/*.wgsl',
        '**/*.vert', '**/*.frag',
        '**/*.vs', '**/*.fs'
      ]
    }
  )],
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      // 如果报错__dirname找不到，需要安装node,执行npm install @types/node --save-dev
      "@": pathResolve("src"),
      "@assets": pathResolve( "src/assets"),
      "@components": pathResolve( "src/components"),
      "@images": pathResolve( "src/assets/images"),
      "@views": pathResolve( "src/views"),
      "@store": pathResolve( "src/store"),
      "@utils": pathResolve( "src/utils"),
      "\/#": pathResolve("types"),
    },
  },

  server: {
    https: false,
    // Listening on all local IPs
    host: true,
    port: 8088,
    // Load proxy configuration from .env
    proxy: 'http://192.168.20.104',
  },
})
