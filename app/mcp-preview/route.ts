// Dev/preview only: serves the raw MCP result-card HTML so you can see it in a browser. With no window.openai
// present, the widget renders its built-in sample data. Not linked, noindex via robots (/mcp is disallowed).
import { WIDGET_HTML } from "@/lib/mcp-widget"

export function GET() {
  return new Response(WIDGET_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } })
}
