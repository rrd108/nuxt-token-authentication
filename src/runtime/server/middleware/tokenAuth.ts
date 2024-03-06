//import { PrismaClient } from '@prisma/client'
//const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // check if the requested route starts with api
  if (!event.node.req.url?.startsWith("/api/")) {
    return;
  }

  const options = useRuntimeConfig().public.nuxtTokenAuthentication;

  if (
    options.noAuthRoutes.includes(
      `${event.node.req.method}:${event.node.req.url}`
    )
  ) {
    return;
  }

  const token = getHeader(event, options.tokenHeader);
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Missing Authentication header",
    });
  }

  //const user = await prisma.users.findFirst({ where: { token } })
  //if (!user) {
  throw createError({ statusCode: 401, statusMessage: "Authentication error" });
  //}
});
