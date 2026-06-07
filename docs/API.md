MMI Place — API v1 Reference

Base path: `/api/v1`

Collections

- GET /api/v1/tools
  - Returns: { items, grouped: { official, students, resource }, count }
- POST /api/v1/tools
  - Body: { name, category, url, source?, description?, emoji?, icon? }
  - Returns: created tool
- GET /api/v1/tools/:id
- PUT /api/v1/tools/:id
- DELETE /api/v1/tools/:id

- GET /api/v1/messages
  - Returns: { items, count }
- POST /api/v1/messages
  - Body: { title, content, channelId, buttons?, publishAt?, expiresAt? }
- GET /api/v1/messages/:id
- PUT /api/v1/messages/:id
- DELETE /api/v1/messages/:id

Services

- GET /api/v1/services/vencat/planning?group=GROUP[&start=ISO&end=ISO]
  - Merges external Vencat timetable with local `planning` overrides.
- POST /api/v1/services/vencat/planning
  - Create a planning override row. Body: { start, end, module, summary, location, teachers[], group }
- GET /api/v1/services/vencat/planning/:id
- PUT /api/v1/services/vencat/planning/:id
- DELETE /api/v1/services/vencat/planning/:id
  - Deletes the `planning` row from the database.

- GET /api/v1/services/planup/tasks?group=GROUP
- POST /api/v1/services/planup/tasks
  - Body: { moduleId, title, description?, groups[], files[], expected[], date?, deadline? }
- GET /api/v1/services/planup/tasks/:id
- PUT /api/v1/services/planup/tasks/:id
- DELETE /api/v1/services/planup/tasks/:id

Notes

- Modify/create/delete endpoints use the Supabase session cookie; privileges follow the existing mmi-core auth model.
- Responses follow a simple JSON shape and use standard HTTP status codes.
