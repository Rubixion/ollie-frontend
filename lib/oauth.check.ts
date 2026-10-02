// Run: npx tsx lib/oauth.check.ts
// Checks the security-critical, DB-free bits of the OAuth server: PKCE S256 + base64url against the RFC 7636
// test vector, and that tokens are random. DB-backed flows (register/code/token) are exercised over HTTP once
// supabase/oauth.sql is applied.
import assert from "node:assert"
import { sha256, verifyPkce, randomToken } from "./oauth"

// RFC 7636 Appendix B test vector.
const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
const challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

const main = async () => {
  assert.equal(await sha256(verifier), challenge, "sha256+base64url must match the RFC 7636 vector")
  assert.ok(await verifyPkce(verifier, challenge), "correct verifier passes")
  // right length, wrong value -> must fail (not just the length guard)
  assert.ok(!(await verifyPkce("x".repeat(43), challenge)), "wrong verifier fails")
  assert.ok(!(await verifyPkce("tooshort", challenge)), "short verifier rejected")
  assert.notEqual(randomToken(), randomToken(), "tokens are unique")
  assert.ok(/^[A-Za-z0-9_-]+$/.test(randomToken()), "tokens are url-safe")
  console.log("oauth.check ok")
}
main()
