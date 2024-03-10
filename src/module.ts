import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addServerHandler,
} from "@nuxt/kit";
import defu from "defu";

// Module options TypeScript interface definition
export interface ModuleOptions {
  authTable?: string;
  tokenField?: string;
  tokenHeader?: string;
  prefix?: string;
  noAuthRoutes: string[];
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-token-authentication",
    configKey: "nuxtTokenAuthentication",
  },

  // Default configuration options of the Nuxt module
  defaults: {
    authTable: "users",
    tokenField: "token",
    tokenHeader: "Token",
    prefix: "",
    noAuthRoutes: [],
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    addServerHandler({
      middleware: true,
      handler: resolver.resolve("./runtime/server/middleware/tokenAuth"),
    });

    nuxt.options.runtimeConfig.public.nuxtTokenAuthentication = defu(
      nuxt.options.runtimeConfig.public.nuxtTokenAuthentication,
      options
    );

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve("./runtime/plugin"));
  },
});
