// The inline result card the ChatGPT apps render (Apps SDK / MCP-Apps widget). One widget, switches on `kind`
// (lookalike | compare | symmetry | stylist). Model-facing text stays in the tool's text content + concise
// structuredContent; the rich render payload (images, bars) rides in result _meta["ollie/widget"], which the
// widget reads but the model does not. Renders only in ChatGPT — other clients show the text fallback.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { SITE_URL } from "@/lib/site-config"

export const WIDGET_URI = "ui://ollie/result.html"

// Self-contained page: no external JS/CSS. Reads data from window.openai (ChatGPT) or the MCP-Apps postMessage,
// and falls back to a sample payload when opened directly in a browser (so it can be previewed at /mcp-preview).
const WIDGET_HTML = /* html */ `<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  :root { --bg:#0b0e14; --card:#121722; --line:#1e2633; --text:#e8edf5; --muted:#8a97a8; --cyan:#35c6f0; }
  * { box-sizing:border-box; }
  body { margin:0; font:14px/1.45 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; color:var(--text);
         background:transparent; padding:4px; }
  .wrap { max-width:520px; }
  h2 { margin:0 0 2px; font-size:16px; font-weight:800; letter-spacing:-.01em; }
  .sub { color:var(--muted); font-size:12px; margin:0 0 12px; }
  .row { display:flex; align-items:center; gap:12px; padding:8px; border:1px solid var(--line); border-radius:12px;
         background:var(--card); margin-bottom:8px; }
  .row img { width:52px; height:52px; border-radius:10px; object-fit:cover; background:#0a0d13; flex:none; }
  .row .name { font-weight:700; }
  .row .kf { color:var(--muted); font-size:12px; }
  .grow { flex:1; min-width:0; }
  .pct { font-weight:800; color:var(--cyan); font-variant-numeric:tabular-nums; font-size:15px; }
  .bar { height:6px; border-radius:99px; background:#0a0d13; overflow:hidden; margin-top:5px; }
  .bar > i { display:block; height:100%; background:var(--cyan); border-radius:99px; }
  .big { font-size:44px; font-weight:900; color:var(--cyan); letter-spacing:-.02em; line-height:1; }
  .big-label { color:var(--muted); font-size:12px; margin-top:4px; }
  .chip { display:inline-block; font-size:11px; color:var(--cyan); border:1px solid var(--line); border-radius:99px; padding:2px 8px; }
  ul { margin:6px 0 0; padding-left:18px; } li { margin:2px 0; }
  a.cta { display:inline-block; margin-top:12px; color:var(--cyan); text-decoration:none; font-weight:700; font-size:13px; }
  .foot { color:var(--muted); font-size:11px; margin-top:10px; }
</style></head>
<body><div class="wrap" id="root"></div>
<script>
(function () {
  var MOCK = { kind:"lookalike", title:"Your closest celebrity lookalikes", subtitle:"Ranked by Ollie's face-matching model",
    items:[{name:"Emma Mackey",knownFor:"British-French actress",pct:93,img:""},{name:"Samara Weaving",knownFor:"Australian actress",pct:91,img:""},
    {name:"Duffy",knownFor:"Welsh singer",pct:80,img:""}], cta:{label:"See your full result →", href:"${SITE_URL}"} };
  var esc = function (s) { return String(s==null?"":s).replace(/[&<>"]/g, function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); };
  var clamp = function (n) { n = Number(n)||0; return Math.max(0, Math.min(100, n)); };

  function rowItem(it) {
    var p = clamp(it.pct);
    return '<div class="row">' +
      (it.img ? '<img src="'+esc(it.img)+'" alt=""/>' : '') +
      '<div class="grow"><div class="name">'+esc(it.name)+'</div>' +
      (it.knownFor ? '<div class="kf">'+esc(it.knownFor)+'</div>' : '') +
      '<div class="bar"><i style="width:'+p+'%"></i></div></div>' +
      '<div class="pct">'+p+'%</div></div>';
  }

  function render(d) {
    if (!d || !d.kind) return;
    var h = '<h2>'+esc(d.title||"Ollie")+'</h2>';
    if (d.subtitle) h += '<p class="sub">'+esc(d.subtitle)+'</p>';
    if (d.kind === "lookalike") {
      h += (d.items||[]).map(rowItem).join("");
    } else if (d.kind === "compare") {
      h += '<div class="big">'+clamp(d.pct)+'%</div><div class="big-label">'+esc(d.verdict||"face similarity")+'</div>' +
           '<div class="bar" style="margin-top:10px"><i style="width:'+clamp(d.pct)+'%"></i></div>';
    } else if (d.kind === "symmetry") {
      h += '<div class="big">'+clamp(d.pct)+'%</div><div class="big-label">'+esc(d.pctLabel||"more symmetric than other faces")+'</div>';
      h += (d.items||[]).map(function(it){ var p=clamp(it.pct); return '<div class="row"><div class="grow"><div class="name">'+esc(it.name)+'</div><div class="bar"><i style="width:'+p+'%"></i></div></div><div class="pct">'+p+'%</div></div>'; }).join("");
    } else if (d.kind === "stylist") {
      if (d.shape) h += '<p><span class="chip">'+esc(d.shape)+' face</span></p>';
      if (d.shapeInfo) h += '<p class="sub">'+esc(d.shapeInfo)+'</p>';
      (d.sections||[]).forEach(function(sec){ h += '<div style="margin-top:8px"><div class="name">'+esc(sec.title)+'</div><ul>'+(sec.items||[]).map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul></div>'; });
    }
    if (d.cta && d.cta.href) h += '<a class="cta" href="'+esc(d.cta.href)+'" target="_blank" rel="noopener">'+esc(d.cta.label||"Open Ollie →")+'</a>';
    if (d.foot) h += '<div class="foot">'+esc(d.foot)+'</div>';
    document.getElementById("root").innerHTML = h;
  }

  function pick() {
    try {
      var o = window.openai;
      if (o) {
        var meta = o.toolResponseMetadata || o.toolResponseMetaData || null;
        if (meta && meta["ollie/widget"]) return meta["ollie/widget"];
        if (o.toolOutput && o.toolOutput.kind) return o.toolOutput;
      }
    } catch (e) {}
    return null;
  }

  var initial = pick();
  render(initial || MOCK);

  // MCP-Apps standard: data arrives via postMessage tool-result notifications.
  window.addEventListener("message", function (ev) {
    var m = ev && ev.data; if (!m || m.method !== "ui/notifications/tool-result") return;
    var p = m.params || {};
    var w = (p._meta && p._meta["ollie/widget"]) || (p.structuredContent && p.structuredContent.kind ? p.structuredContent : null);
    if (w) render(w);
  }, { passive: true });

  // ChatGPT fires a global event when toolOutput/metadata become available.
  window.addEventListener("openai:set_globals", function () { var d = pick(); if (d) render(d); }, { passive: true });
})();
</script></body></html>`

/** Register the shared result widget on an MCP server. Call once per request in each app's build(). */
export function registerWidget(server: McpServer) {
  server.registerResource("ollie-result", WIDGET_URI, {}, async () => ({
    contents: [
      {
        uri: WIDGET_URI,
        mimeType: "text/html+skybridge", // ChatGPT-native; MCP-Apps clients also accept it
        text: WIDGET_HTML,
        _meta: {
          "openai/widgetPrefersBorder": true,
          ui: {
            prefersBorder: true,
            domain: SITE_URL,
            // Allow the card to load celebrity thumbnails from the site and inline data: images from the matcher.
            csp: { resourceDomains: [SITE_URL, "data:"], connectDomains: [] },
          },
        },
      },
    ],
  }))
}

/** Tool _meta that points ChatGPT at the widget (both the OpenAI alias and the MCP-Apps standard key). */
export const widgetMeta = { "openai/outputTemplate": WIDGET_URI, ui: { resourceUri: WIDGET_URI } }

/** Build a tool result: text fallback (for non-widget clients) + concise structuredContent + the widget payload. */
export function widgetResult(textFallback: string, structured: Record<string, unknown>, widget: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text: textFallback }],
    structuredContent: structured,
    _meta: { "openai/outputTemplate": WIDGET_URI, "ollie/widget": widget },
  }
}

export { WIDGET_HTML }
