// Run: npx tsx lib/oauth.check.ts
// Checks the security-critical, DB-free bits of the OAuth server: PKCE S256 + base64url against the RFC 7636
// test vector, and that tokens are random. DB-backed flows (register/code/token) are exercised over HTTP once
// supabase/oauth.sql is applied.
import assert from "node:assert"
import { sha256, verifyPkce, randomToken } from "./oauth"
import { isPrivateHost } from "./mcp"

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

  // SSRF host guard for the MCP image download.
  for (const h of ["localhost", "127.0.0.1", "10.0.0.5", "192.168.1.1", "169.254.169.254", "172.16.0.1", "172.31.255.255", "::1", "metadata.google.internal", "0.0.0.0"])
    assert.ok(isPrivateHost(h), `${h} must be blocked`)
  for (const h of ["www.ollieml.com", "files.oaiusercontent.com", "8.8.8.8", "172.15.0.1", "172.32.0.1"])
    assert.ok(!isPrivateHost(h), `${h} must be allowed`)

  console.log("oauth.check ok")
}
main()
