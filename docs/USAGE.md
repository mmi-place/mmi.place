Quick Usage — curl examples

Assumes the server is reachable at `http://localhost:3000` and the browser session cookie is valid for authenticated endpoints.

List tools

curl -s "http://localhost:3000/api/v1/tools"

Create a tool (requires auth cookie)

curl -X POST "http://localhost:3000/api/v1/tools" \
 -H "Content-Type: application/json" \
 --cookie "mmi_sb_auth=YOUR_COOKIE" \
 -d '{"name":"Example Tool","category":"resource","url":"https://example.com"}'

Get vencat planning for a group

curl -s "http://localhost:3000/api/v1/services/vencat/planning?group=LP2A"

Create a vencat planning override

curl -X POST "http://localhost:3000/api/v1/services/vencat/planning" \
 -H "Content-Type: application/json" \
 --cookie "mmi_sb_auth=YOUR_COOKIE" \
 -d '{"start":"2026-06-10T08:00:00Z","end":"2026-06-10T10:00:00Z","module":"Math","summary":"Extra revision","group":"LP2A"}'

Delete a planning row (vencat)

curl -X DELETE "http://localhost:3000/api/v1/services/vencat/planning/ROW_ID" \
 --cookie "mmi_sb_auth=YOUR_COOKIE"

Deployment note

- Serve the Nuxt app on a Nitro-capable host (Node, Vercel, Fly) to expose these API routes. Static `generate` will not include server handlers.
