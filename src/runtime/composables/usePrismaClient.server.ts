//import { useNuxtApp } from "#imports";
import { useNuxtApp } from "#app";

export const usePrismaClient = () => {
  const { $prisma } = useNuxtApp();
  console.log({ $prisma });
  return { $prisma };
};
