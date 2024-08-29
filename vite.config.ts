import { type ConfigEnv, type UserConfigExport, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default (configEnv: ConfigEnv): UserConfigExport => {
  // @ts-ignore
  const viteEnv = loadEnv(configEnv.mode, process.cwd());
  const { VITE_PUBLIC_PATH } = viteEnv;

  return {
    base: VITE_PUBLIC_PATH,
    plugins: [
      vue(),
      vueJsx(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
  };
};
