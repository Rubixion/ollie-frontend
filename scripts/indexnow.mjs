// Tells Bing, Yandex and other IndexNow engines that the site changed. Runs after `npm run deploy`.
// Bing's index also feeds ChatGPT search and Copilot. Never fails the deploy: it only logs.
// ponytail: submits every sitemap URL each deploy (fine under IndexNow's 10,000-URL limit); send only changed URLs if the site grows.
const SITE = "https://www.ollieml.com" // must match SITE_URL in lib/site-config.ts
const KEY = "459105cf78d8c99b9e584a4fd3aac94a" // public/<KEY>.txt must contain exactly this

try {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text()
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
  })
  console.log(`IndexNow: ${urlList.length} URLs -> HTTP ${res.status}`) // 200/202 = accepted
} catch (err) {
  console.warn("IndexNow ping failed (deploy is fine):", err.message)
}
