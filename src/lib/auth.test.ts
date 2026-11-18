// @vitest-environment node
// jose's WebCrypto key checks are realm-sensitive; jsdom's Uint8Array fails
// `instanceof` against node's, so this file runs in the plain node environment.
import { describe, expect, it } from "vitest";
import { createSessionToken, hashPassword, verifyPassword, verifySessionToken } from "@/lib/auth";

describe("password hashing", () => {
  it("round-trips a correct password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword("correct-horse-battery-staple", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("never stores the password in plaintext", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(hash).not.toBe("correct-horse-battery-staple");
  });
});

describe("session tokens", () => {
  it("round-trips a user id", async () => {
    const token = await createSessionToken("user_123");
    expect(await verifySessionToken(token)).toBe("user_123");
  });

  it("rejects a garbage token", async () => {
    expect(await verifySessionToken("not-a-real-token")).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken("user_123");
    const tampered = token.slice(0, -4) + "abcd";
    expect(await verifySessionToken(tampered)).toBeNull();
  });
});
