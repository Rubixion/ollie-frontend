// The inline result card the ChatGPT apps render (Apps SDK / MCP-Apps widget). One widget, switches on `kind`
// (lookalike | compare | symmetry | stylist). Model-facing text stays in the tool's text content + concise
// structuredContent; the rich render payload (images, bars) rides in result _meta["ollie/widget"], which the
// widget reads but the model does not. Renders only in ChatGPT — other clients show the text fallback.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { SITE_URL } from "@/lib/site-config"

export const WIDGET_URI = "ui://ollie/result.html"

// Self-contained page: no external JS/CSS. Reads data from window.openai (ChatGPT) or the MCP-Apps postMessage.
// Inside a host it shows a skeleton until the result arrives; only a page opened directly (/mcp-preview, or
// ?kind=symmetry etc.) renders the sample data. Styled to docs/DESIGN.md: black, white type, one blue (--ollie-cyan).
// The gauge is a port of components/ui/animated-circular-progress-bar (21st.dev, Magic UI) and the rows copy the
// runners-up list in components/celebrity-finder.tsx, since the widget can't run React.
const WIDGET_HTML = /* html */ `<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  :root { --bg:#0a0a0a; --t80:rgb(255 255 255/.8); --t70:rgb(255 255 255/.7); --t60:rgb(255 255 255/.6);
          --t50:rgb(255 255 255/.5); --line:rgb(255 255 255/.1); --well:rgb(255 255 255/.04); --blue:rgb(100 130 210); }
  * { box-sizing:border-box; }
  html, body { margin:0; background:transparent; }
  body { font:14px/1.5 Outfit,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; color:#fff;
         -webkit-font-smoothing:antialiased; }
  .card { position:relative; overflow:hidden; border-radius:20px; padding:20px; color-scheme:dark;
          background:linear-gradient(to bottom, rgb(255 255 255/.055), rgb(255 255 255/.015)), var(--bg);
          box-shadow:inset 0 1px 0 rgb(255 255 255/.07); }
  .top { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px; }
  .mark { font-size:11px; font-weight:900; letter-spacing:.28em; color:var(--t70); }
  .tag { font-size:11px; font-weight:600; color:var(--t50); }
  h2 { margin:0; font-size:20px; font-weight:900; letter-spacing:-.02em; line-height:1.2; text-wrap:balance; }
  .sub { margin:4px 0 0; color:var(--t60); font-size:13px; text-wrap:pretty; }
  .num { font-variant-numeric:tabular-nums; }
  .blue { color:var(--blue); }

  /* #1 match */
  .hero { display:flex; align-items:center; gap:14px; margin-top:16px; }
  .hero .ph { width:76px; height:76px; border-radius:12px; border-color:rgb(100 130 210/.4); }
  .hero .nm { font-size:20px; font-weight:900; letter-spacing:-.02em; line-height:1.2; }
  .hero .kf { font-size:13px; }
  .hero .pc { font-size:26px; font-weight:900; letter-spacing:-.02em; }
  .badge { display:inline-block; margin-bottom:4px; font-size:11px; font-weight:700; color:#000; background:var(--blue);
           border-radius:6px; padding:1px 6px; }
  .label { margin:18px 0 8px; color:var(--t70); font-size:13px; font-weight:600; }

  /* runners-up rows */
  ol { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
  .row { display:flex; align-items:center; gap:12px; padding:10px; border-radius:12px; background:var(--well); }
  .rk { width:16px; flex:none; text-align:center; font-size:12px; font-weight:700; color:var(--t60); }
  .ph { flex:none; width:48px; height:48px; border-radius:8px; border:1px solid var(--line); background:rgb(255 255 255/.05);
        object-fit:cover; display:grid; place-items:center; color:var(--t60); font-weight:700; font-size:14px; }
  .grow { flex:1; min-width:0; }
  .line1 { display:flex; align-items:baseline; justify-content:space-between; gap:8px; }
  .nm { font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .kf { color:var(--t60); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pc { flex:none; font-weight:700; color:var(--blue); font-size:13px; }
  .bar { height:6px; border-radius:99px; background:var(--line); overflow:hidden; margin-top:6px; }
  .bar > i { display:block; height:100%; width:0; background:var(--blue); border-radius:99px; transition:width .8s cubic-bezier(.2,.8,.2,1); }

  /* score gauge (symmetry, compare) */
  .score { display:flex; align-items:center; gap:18px; margin-top:16px; }
  .gauge { position:relative; width:112px; height:112px; flex:none; }
  .gauge svg { width:100%; height:100%; transform:rotate(-90deg); }
  .gauge circle { fill:none; stroke-width:10; stroke-linecap:round; }
  .gauge .bg { stroke:var(--line); }
  .gauge .fg { stroke:var(--blue); transition:stroke-dashoffset 1s ease; }
  .gauge span { position:absolute; inset:0; display:grid; place-items:center; font-size:30px; font-weight:900; letter-spacing:-.02em; }
  .verdict { font-size:20px; font-weight:900; letter-spacing:-.02em; line-height:1.2; }
  .regions { list-style:none; margin:18px 0 0; padding:0; display:flex; flex-direction:column; gap:10px; }
  .regions .line1 { font-size:13px; } .regions .line1 span:first-child { color:var(--t80); } .regions .line1 span:last-child { color:var(--t60); }

  /* stylist */
  .chip { display:inline-block; margin-top:12px; font-size:12px; font-weight:600; color:var(--blue);
          border:1px solid rgb(100 130 210/.4); border-radius:8px; padding:2px 8px; }
  .sec { margin-top:14px; padding:12px 14px; border-radius:12px; background:var(--well); }
  .sec b { display:block; font-size:13px; } .sec ul { margin:6px 0 0; padding-left:18px; color:var(--t70); font-size:13px; }
  .sec li { margin:2px 0; }

  .cta { display:flex; align-items:center; justify-content:center; min-height:44px; margin-top:18px; border-radius:12px;
         border:1px solid var(--blue); color:var(--blue); font-weight:700; font-size:14px; text-decoration:none; }
  .cta:hover { background:rgb(100 130 210/.1); }
  .cta:focus-visible { outline:2px solid var(--blue); outline-offset:2px; }
  .more { margin-top:18px; } .more p { margin:0 0 8px; color:var(--t70); font-size:13px; font-weight:600; }
  .more a { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:8px; padding:12px 14px; border-radius:12px;
            background:var(--well); color:#fff; font-size:13px; font-weight:600; text-decoration:none; }
  .more a span { color:var(--blue); } .more a:hover { background:rgb(255 255 255/.07); }
  .more a:focus-visible { outline:2px solid var(--blue); outline-offset:2px; }
  .foot { margin-top:12px; color:var(--t50); font-size:12px; text-align:center; }

  /* loading skeleton */
  .sk { border-radius:8px; background:linear-gradient(90deg, rgb(255 255 255/.05) 25%, rgb(255 255 255/.1) 50%, rgb(255 255 255/.05) 75%);
        background-size:200% 100%; animation:sh 1.4s linear infinite; }
  @keyframes sh { to { background-position:-200% 0; } }
  .in { animation:up .4s ease both; } @keyframes up { from { opacity:0; transform:translateY(8px); } }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation:none !important; transition:none !important; } }
</style></head>
<body><div class="card" id="root" aria-live="polite"></div>
<script>
(function () {
  var MOCKS = {
    lookalike: { kind:"lookalike", title:"Your closest celebrity lookalikes", subtitle:"Ranked by Ollie's face-matching model",
      items:[{name:"Emma Mackey",knownFor:"British-French actress",pct:93,img:""},{name:"Samara Weaving",knownFor:"Australian actress",pct:91,img:""},
      {name:"Duffy",knownFor:"Welsh singer",pct:80,img:""},{name:"Margot Robbie",knownFor:"Australian actress",pct:78,img:""}],
      cta:{label:"See your shareable card →", href:"${SITE_URL}/celebrity-lookalike"} },
    symmetry: { kind:"symmetry", title:"Your face symmetry", pct:72, verdict:"More symmetric than most", pctLabel:"more symmetric than 3,898 real faces",
      items:[{name:"Eyes",pct:81},{name:"Eyebrows",pct:64},{name:"Nose",pct:77},{name:"Mouth",pct:58},{name:"Jaw",pct:69}],
      cta:{label:"See the mirrored view →", href:"${SITE_URL}/face-symmetry-test"},
      more:[{label:"Which celebrity do you look like?", href:"${SITE_URL}/celebrity-lookalike"},{label:"Try hairstyles and outfits on your face with AI", href:"${SITE_URL}/ai-stylist"}], foot:"Symmetry only, not an attractiveness score." },
    compare: { kind:"compare", title:"Face comparison", pct:64, verdict:"How alike these two faces look", cta:{label:"Make a shareable card →", href:"${SITE_URL}/compare-faces"} }
  };
  var root = document.getElementById("root");
  var esc = function (s) { return String(s==null?"":s).replace(/[&<>"]/g, function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); };
  var clamp = function (n) { n = Number(n)||0; return Math.max(0, Math.min(100, Math.round(n))); };
  var initials = function (n) { return esc(String(n||"?").split(" ").map(function(w){return w.charAt(0);}).slice(0,2).join("").toUpperCase()); };
  var photo = function (it) { return it.img ? '<img class="ph" src="'+esc(it.img)+'" alt="" loading="lazy"/>' : '<div class="ph" aria-hidden="true">'+initials(it.name)+'</div>'; };
  var bar = function (p) { return '<div class="bar" aria-hidden="true"><i data-w="'+clamp(p)+'"></i></div>'; };
  var head = function (tag) { return '<div class="top"><span class="mark">OLLIE</span><span class="tag">'+esc(tag)+'</span></div>'; };
  var R = 45, C = 2 * Math.PI * R;
  var gauge = function (p) { return '<div class="gauge" role="img" aria-label="'+clamp(p)+' out of 100"><svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="'+R+'"/>' +
    '<circle class="fg" cx="50" cy="50" r="'+R+'" stroke-dasharray="'+C+'" stroke-dashoffset="'+C+'" data-p="'+clamp(p)+'"/></svg><span class="num">'+clamp(p)+'</span></div>'; };

  function skeleton() {
    root.innerHTML = head("Working…") + '<div class="sk" style="height:22px;width:62%"></div><div class="sk" style="height:14px;width:42%;margin-top:8px"></div>' +
      [0,1,2].map(function(){ return '<div class="row" style="margin-top:10px"><div class="sk" style="width:48px;height:48px;flex:none"></div><div class="grow"><div class="sk" style="height:14px;width:55%"></div><div class="sk" style="height:6px;margin-top:10px"></div></div></div>'; }).join("");
  }

  function render(d) {
    if (!d || !d.kind) return;
    var h = "";
    if (d.kind === "lookalike") {
      var it = d.items || [], top = it[0];
      h += head("Celebrity lookalike") + '<h2>'+esc(d.title)+'</h2>' + (d.subtitle ? '<p class="sub">'+esc(d.subtitle)+'</p>' : '');
      if (top) h += '<div class="hero in">' + photo(top) + '<div class="grow"><span class="badge num">#1</span><div class="nm">'+esc(top.name)+'</div>' +
        (top.knownFor ? '<div class="kf">'+esc(top.knownFor)+'</div>' : '') + '</div><div class="pc num">'+clamp(top.pct)+'%</div></div>' + bar(top.pct);
      if (it.length > 1) h += '<p class="label">Runners-up</p><ol>' + it.slice(1).map(function (m, j) {
        return '<li class="row in" style="animation-delay:'+(0.15 + j*0.07)+'s"><span class="rk num">'+(j+2)+'</span>' + photo(m) +
          '<div class="grow"><div class="line1"><span class="nm">'+esc(m.name)+'</span><span class="pc num">'+clamp(m.pct)+'%</span></div>' +
          (m.knownFor ? '<div class="kf">'+esc(m.knownFor)+'</div>' : '') + bar(m.pct) + '</div></li>';
      }).join("") + '</ol>';
    } else if (d.kind === "symmetry" || d.kind === "compare") {
      var sym = d.kind === "symmetry", p = clamp(d.pct);
      h += head(sym ? "Face symmetry test" : "Compare faces") + '<h2>'+esc(d.title)+'</h2>';
      h += '<div class="score in">' + gauge(p) + '<div><div class="verdict">'+esc(d.verdict || (sym ? "Your result" : "Face similarity"))+'</div><p class="sub">' +
        (sym ? 'More symmetric than <b class="blue num">'+p+'%</b> of '+esc(String(d.pctLabel||"other faces").replace(/^more symmetric than /, ""))
             : '<b class="blue num">'+p+'%</b> alike on Ollie&#39;s face-matching model. Most unrelated people score 20-50%.') + '</p></div></div>';
      if (sym && d.items && d.items.length) h += '<ul class="regions">' + d.items.map(function (r) {
        return '<li><div class="line1"><span>'+esc(r.name)+'</span><span class="num">more symmetric than '+clamp(r.pct)+'%</span></div>'+bar(r.pct)+'</li>';
      }).join("") + '</ul>';
    } else if (d.kind === "stylist") {
      h += head("Ollie Stylist") + '<h2>'+esc(d.title||"Your style")+'</h2>';
      if (d.shape) h += '<span class="chip">'+esc(d.shape)+' face</span>';
      if (d.shapeInfo) h += '<p class="sub" style="margin-top:8px">'+esc(d.shapeInfo)+'</p>';
      (d.sections||[]).forEach(function (sec) { h += '<div class="sec in"><b>'+esc(sec.title)+'</b><ul>'+(sec.items||[]).map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul></div>'; });
    } else return;
    if (d.cta && d.cta.href) h += '<a class="cta" href="'+esc(d.cta.href)+'" target="_blank" rel="noopener">'+esc(d.cta.label||"Open Ollie →")+'</a>';
    if (d.more && d.more.length) h += '<div class="more"><p>Also on Ollie</p>' + d.more.map(function (m) { return '<a href="'+esc(m.href)+'" target="_blank" rel="noopener">'+esc(m.label)+'<span aria-hidden="true">→</span></a>'; }).join("") + '</div>';
    if (d.foot) h += '<div class="foot">'+esc(d.foot)+'</div>';
    root.innerHTML = h;
    // grow the bars and the gauge after first paint
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      root.querySelectorAll(".bar > i").forEach(function (el) { el.style.width = el.getAttribute("data-w") + "%"; });
      root.querySelectorAll(".gauge .fg").forEach(function (el) { el.style.strokeDashoffset = String(C * (1 - el.getAttribute("data-p") / 100)); });
    }); });
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

  var last = "";
  function show(d) { if (!d) return; var k = JSON.stringify(d); if (k !== last) { last = k; render(d); } }
  var initial = pick();
  if (initial) show(initial);
  else if (window.openai || window.parent !== window) skeleton(); // in a host: wait for the real result, never flash sample data
  else { var q = /[?&]kind=([a-z]+)/.exec(location.search); render(MOCKS[q && q[1]] || MOCKS.lookalike); }

  // MCP-Apps standard: data arrives via postMessage tool-result notifications.
  window.addEventListener("message", function (ev) {
    var m = ev && ev.data; if (!m || m.method !== "ui/notifications/tool-result") return;
    var p = m.params || {};
    show((p._meta && p._meta["ollie/widget"]) || (p.structuredContent && p.structuredContent.kind ? p.structuredContent : null));
  }, { passive: true });

  // ChatGPT fires a global event when toolOutput/metadata become available.
  window.addEventListener("openai:set_globals", function () { show(pick()); }, { passive: true });
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
          "openai/widgetPrefersBorder": false, // the card draws its own surface
          ui: {
            prefersBorder: false,
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
