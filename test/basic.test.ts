import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

describe("middleware", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("./fixtures/basic", import.meta.url)),
  });

  it("renders the index page without authentication", async () => {
    const response = await $fetch("/");
    expect(response).toContain("<div>basic</div>");
  });

  it.skip("allow access to noAuthRoute", async () => {
    const response = await $fetch("/api/route_noauth", { method: "GET" });
    expect(response).toContain("Gauranga");
  });

  it("deny acces without a token", async () => {
    try {
      const response = await $fetch("/api/users", { method: "GET" });
      expect(true).toBe(false);
    } catch (err) {
      expect(err.status).toBe(401);
    }
  });

  it.todo("deny access with an invalid token");
  it.todo("allow access with vaid token");
});
