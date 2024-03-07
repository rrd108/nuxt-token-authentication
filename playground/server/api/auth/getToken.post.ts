import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const data = await readBody(event);

  const user = await prisma.users.findUnique({
    where: {
      email: data.email,
      password: data.password,
    },
  });

  delete user?.password;
  return { user };
});
