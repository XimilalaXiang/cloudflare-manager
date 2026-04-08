# Workers

All endpoints use prefix `/cf/:accountId/workers`.

## GET /cf/:accountId/workers

List all Workers scripts.

**Response (200):**
```json
[{ "id": "my-worker", "size": 1024, "created_on": "...", "modified_on": "..." }]
```

## POST /cf/:accountId/workers

Deploy a Worker script.

**Request:**
```json
{
  "script_name": "my-worker",
  "content": "export default { fetch(req) { return new Response('Hello!') } }",
  "module": true
}
```

## GET /cf/:accountId/workers/:scriptName

Get Worker source code.

**Response (200):**
```json
{ "script_name": "my-worker", "code": "export default { ... }" }
```

## DELETE /cf/:accountId/workers/:scriptName

Delete a Worker script.
