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

  it("allow access to noAuthRoute", async () => {
    const response = await $fetch("/api/route_noauth", { method: "GET" });
    expect((response as any).result).toBe("Gauranga");
  });

  it("deny acces without a token", async () => {
    try {
      await $fetch("/api/users", { method: "GET" });
      expect(true).toBe(false);
    } catch (err) {
      const typedErr = err as { statusCode: number; statusMessage: string };
      expect(typedErr.statusCode).toBe(401);
      expect(typedErr.statusMessage).toBe("Missing Authentication header");
    }
  });

  it("deny access with an invalid token", async () => {
    try {
      await $fetch("/api/users", {
        method: "GET",
        headers: { token: "invalidTestToken" },
      });
      expect(true).toBe(false);
    } catch (err) {
      const typedErr = err as { statusCode: number; statusMessage: string };
      expect(typedErr.statusCode).toBe(401);
      expect(typedErr.statusMessage).toBe("Authentication error");
    }
  });

  it("allow access with valid token", async () => {
    const response = await $fetch("/api/users", {
      method: "GET",
      headers: { token: "Gauranga%TestToken0123456789" },
    });
    expect((response as any).results[0].name).toBe("Gauranga");
  });
});
