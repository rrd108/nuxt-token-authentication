//import { PrismaClient } from '@prisma/client'
//const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log("👉 Token Auth Middleware");

  // check if the requested route starts with api
  if (!event.node.req.url?.startsWith("/api/")) {
    return;
  }

  const options = useRuntimeConfig().public.nuxtTokenAuthentication;

  console.log("tokenAuth: options", options);

  console.log(`tokenAuth: ${event.node.req.method}:${event.node.req.url}`);
  if (
    options.noAuthRoutes.includes(
      `${event.node.req.method}:${event.node.req.url}`
    )
  ) {
    console.log("tokenAuth: No auth required");
    return;
  }

  const token = getHeader(event, "Token");
  console.log("tokenAuth: token");
  if (!token) {
    throw createError({
      status: 401,
      message: "Missing Authentication header",
    });
  }

  //const user = await prisma.users.findFirst({ where: { token } })
  //if (!user) {
  //throw createError({ status: 401, message: 'Authentication error' })
  //}
});
