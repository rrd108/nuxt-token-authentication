import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const data = await readBody(event);

  const options = useRuntimeConfig().public.nuxtTokenAuthentication;
  const user = await prisma[options.authTable].findUnique({
    where: {
      email: data.email,
      password: data.password,
    },
  });

  delete user?.password;
  return { user };
});
