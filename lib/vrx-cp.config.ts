import { defineConfig } from '@vrx/cp'
import VueMacros from 'vue-macros/vite'

export default defineConfig({
  type: ({ vue, vueJsx }) => VueMacros({ plugins: { vue: vue(), vueJsx: vueJsx() } }),
  docs: {
    webTypes: false,
    globalComponentDts: false,
  },
  bundle: true,
})
