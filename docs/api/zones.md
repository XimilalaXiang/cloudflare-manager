# Zones & DNS

## GET /cf/:accountId/zones

List all zones for an account.

**Response (200):**
```json
[{ "id": "zone-id", "name": "example.com", "status": "active", "paused": false }]
```

## GET /cf/:accountId/zones/:zoneId

Get zone details.

## GET /cf/:accountId/zones/:zoneId/dns

List DNS records.

**Response (200):**
```json
[{ "id": "record-id", "type": "A", "name": "example.com", "content": "1.2.3.4", "ttl": 3600, "proxied": true }]
```

## POST /cf/:accountId/zones/:zoneId/dns

Create a DNS record.

**Request:**
```json
{ "type": "A", "name": "sub.example.com", "content": "1.2.3.4", "ttl": 1, "proxied": true }
```

## PUT /cf/:accountId/zones/:zoneId/dns/:recordId

Update a DNS record (same body format as create).

## DELETE /cf/:accountId/zones/:zoneId/dns/:recordId

Delete a DNS record.
