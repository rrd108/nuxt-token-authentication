import NuxtTokenAuthentication from "../../../src/module";

export default defineNuxtConfig({
  modules: [NuxtTokenAuthentication],
  nuxtTokenAuthentication: {
    noAuthRoutes: ["GET:/api/route_noauth"],
  },
});
