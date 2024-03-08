import { defineNuxtPlugin } from "#app";
//import { PrismaClient } from "@prisma/client";

//export default defineNuxtPlugin((nuxtApp) => {
export default defineNuxtPlugin(() => {
  console.log("Plugin injected by nuxt-token-authentication!");
  //const prisma = new PrismaClient();
  //nuxtApp.provide("prisma", prisma);
});
