import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addServerHandler,
  addImportsDir,
} from "@nuxt/kit";

// Module options TypeScript interface definition
export interface ModuleOptions {
  tokenHeader: string;
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

    addImportsDir(resolver.resolve("./runtime/composables"));

    addServerHandler({
      middleware: true,
      handler: resolver.resolve("./runtime/server/middleware/tokenAuth"),
    });

    nuxt.options.runtimeConfig.public.nuxtTokenAuthentication = options;

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve("./runtime/plugin"));
  },
});
