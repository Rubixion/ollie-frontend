// Run: npx tsx lib/oauth.check.ts
// Checks the security-critical, DB-free bits of the OAuth server: PKCE S256 + base64url against the RFC 7636
// test vector, and that tokens are random. DB-backed flows (register/code/token) are exercised over HTTP once
// supabase/oauth.sql is applied.
import assert from "node:assert"
import { sha256, verifyPkce, randomToken, redirectAllowed } from "./oauth"
import { imageType, isPrivateHost } from "./mcp"

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

  // Redirect allowlist: loopback + known vendor hosts pass; arbitrary remote hosts are rejected (consent-phishing guard).
  for (const u of ["http://localhost:8976/cb", "http://127.0.0.1:52000/", "https://chatgpt.com/aip/cb", "https://claude.ai/api/mcp/cb", "https://auth.perplexity.ai/cb", "https://www.cursor.com/cb"])
    assert.ok(redirectAllowed(u), `${u} must be allowed`)
  for (const u of ["https://evil.com/cb", "https://chatgpt.com.evil.com/cb", "http://evil.com/cb", "https://notchatgpt.com/cb", "ftp://localhost/x"])
    assert.ok(!redirectAllowed(u), `${u} must be rejected`)

  console.log("oauth.check ok")
}
main()

// imageType: sniffs uploads served as application/octet-stream
const bytes = (...p: (number | string)[]) => new Uint8Array(p.flatMap((x) => (typeof x === "string" ? [...x].map((c) => c.charCodeAt(0)) : [x])))
assert.equal(imageType(bytes(0xff, 0xd8, 0xff, 0xe0)), "image/jpeg")
assert.equal(imageType(bytes(0x89, "PNG", 13, 10)), "image/png")
assert.equal(imageType(bytes("RIFF", 0, 0, 0, 0, "WEBP")), "image/webp")
assert.equal(imageType(bytes(0, 0, 0, 24, "ftypheic")), "image/heic")
assert.equal(imageType(bytes(0, 0, 0, 24, "ftypisom")), null) // mp4
assert.equal(imageType(bytes("<html>")), null)
console.log("imageType ok")
