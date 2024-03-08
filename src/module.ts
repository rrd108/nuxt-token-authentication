import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addServerHandler,
} from "@nuxt/kit";

// Module options TypeScript interface definition
export interface ModuleOptions {
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
    tokenHeader: "Token",
    noAuthRoutes: [],
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    addServerHandler({
      middleware: true,
      handler: resolver.resolve("./runtime/server/middleware/tokenAuth"),
    });

    nuxt.options.runtimeConfig.public.nuxtTokenAuthentication = options;

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve("./runtime/plugin"));
  },
});
