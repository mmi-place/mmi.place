MMI Place — Local Documentation

This folder contains local developer documentation for the versioned API and service endpoints implemented under `/server/api/v1`.

Files:

- [API Reference](API.md) — list of endpoints and brief usage.
- [Usage Examples](USAGE.md) — curl examples for common operations.

Notes:

- The API requires Nitro/Node runtime to handle server routes. Static `nuxt generate` does not publish API endpoints.
- Authentication uses the Supabase session cookie (`mmi_sb_auth`) and is honored by the server-side mmi-core bootstrap.
