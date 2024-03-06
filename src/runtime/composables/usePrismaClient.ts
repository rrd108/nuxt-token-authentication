import { useNuxtApp } from "#imports";

export const usePrismaClient = () => {
  const $prisma = useNuxtApp().$prisma;
  console.log({ $prisma });
  return { $prisma };
};
