import { UserConfig } from 'vite'
import VuePlugin from '@vitejs/plugin-vue'
import ViteIcons, { ViteIconsResolver } from 'vite-plugin-icons'
import ViteComponents from 'vite-plugin-components'

const config: UserConfig = {
  plugins: [
    VuePlugin(),
    // https://github.com/antfu/vite-plugin-components
    ViteComponents({
      customComponentResolvers: [
        ViteIconsResolver({
          componentPrefix: '',
        }),
      ],
    }),
    // https://github.com/antfu/vite-plugin-icons
    ViteIcons({
      scale: 1.1,
      defaultStyle: 'vertical-align: middle;',
    }),
  ],
  build: {
    minify: false,
  },
}

export default config
