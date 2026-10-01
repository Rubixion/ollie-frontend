<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Ollie build rules

Read the "Build checklist" in `../CLAUDE.md` before building anything. In short:
- All UI comes from 21st.dev through the `21st` MCP. Never hand-code components.
- Every indexable page is SEO'd from live data: GSC + GA4 + OpenSEO keyword research. Also optimize for ChatGPT and other AI answers (GEO): a quotable first paragraph and an `llms.txt` update.
- Every feature connects to revenue (affiliate links, the paid unlock, email) and is tracked in GA4.
- Premium feel, no "AI slop". Copy rules: say "the Ollie team", never "I"; one blue accent.
