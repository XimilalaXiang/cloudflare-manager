# Worker Routes

## GET /cf/:accountId/zones/:zoneId/routes

List Worker routes for a zone.

## POST /cf/:accountId/zones/:zoneId/routes

Create a Worker route.

**Request:**
```json
{ "pattern": "example.com/api/*", "script": "my-worker" }
```

## DELETE /cf/:accountId/zones/:zoneId/routes/:routeId

Delete a Worker route.
