//import { usePrismaClient } from "../../composables/usePrismaClient.server";
import { PrismaClient } from "@prisma/client";
import { createError, defineEventHandler, getHeader } from "h3";
import { useRuntimeConfig } from "#imports";

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

  const strippedToken = token
    .toLowerCase()
    .replace(`${options.prefix?.toLowerCase()} `, "");
  let user;
  try {
    const prisma = new PrismaClient();
    user = await prisma[options.authTable].findFirst({
      where: { [options.tokenField]: strippedToken },
    });
  } catch (error) {
    console.error({ error });
  }

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication error",
    });
  }
});
