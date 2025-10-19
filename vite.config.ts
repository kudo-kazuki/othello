import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { copyFileSync, mkdirSync, writeFileSync } from 'fs'

const htaccess = `
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  #wasm_pkg ディレクトリはリライト対象外
  RewriteCond %{REQUEST_URI} ^/wasm_pkg/
  RewriteRule .* - [L]

  #assets ディレクトリも除外（←これが重要！）
  RewriteCond %{REQUEST_URI} ^/assets/
  RewriteRule .* - [L]

  #favicon.ico も除外
  RewriteCond %{REQUEST_URI} ^/favicon\.ico$
  RewriteRule .* - [L]

  #通常のSPAリライト
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# === Added automatically by build ===
<IfModule mod_mime.c>
  AddType application/wasm .wasm
  AddType text/javascript .js
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE application/wasm
</IfModule>

`

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        Pages({
            dirs: 'src/pages',
            extensions: ['vue'],
        }),
        Components({
            dirs: ['src/components'],
            extensions: ['vue'],
            deep: true,
            dts: 'src/components.d.ts',
            resolvers: [ElementPlusResolver()],
        }),
        AutoImport({
            imports: ['vue', 'vue-router'],
            dts: 'src/auto-imports.d.ts',
            resolvers: [ElementPlusResolver()],
        }),
        // ✅ ビルド後の自動コピー＋.htaccess生成
        {
            name: 'copy-wasm-files',
            closeBundle() {
                const src = resolve(__dirname, 'src/wasm_pkg')
                const dest = resolve(__dirname, 'dist/wasm_pkg')
                mkdirSync(dest, { recursive: true })

                // wasmファイルをコピー
                for (const file of ['salesman.js', 'salesman_bg.wasm']) {
                    copyFileSync(`${src}/${file}`, `${dest}/${file}`)
                }

                // .htaccessを固定内容で生成
                const htaccessPath = resolve(__dirname, 'dist/.htaccess')
                writeFileSync(htaccessPath, htaccess.trim() + '\n')

                console.log('✅ Copied wasm_pkg to dist/wasm_pkg')
                console.log('✅ Generated dist/.htaccess')
            },
        },
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'), // '@'を'src'ディレクトリにマッピング
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `
      @use "@/scss/variables.scss" as var;
      @use "@/scss/mixins.scss" as mixin;
    `,
            },
        },
    },
    assetsInclude: ['**/*.mp3', '**/*.wav'],
    build: {
        rollupOptions: {
            input: resolve(__dirname, 'index.html'),
        },
        outDir: 'dist',
    },
})
