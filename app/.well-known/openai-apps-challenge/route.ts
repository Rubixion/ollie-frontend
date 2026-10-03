// OpenAI plugin portal domain verification for www.ollieml.com (Face Symmetry Test listing). The portal expects the
// token alone as plain text. If another listing (e.g. Celebrity Lookalike) shows a different token, ask which wins.
export const dynamic = "force-static"

export function GET() {
  return new Response("GtdXQPALHGtQ88m6QLoCluN95FzkOH9Kl5-ndFLSMLk", { headers: { "content-type": "text/plain; charset=utf-8" } })
}
