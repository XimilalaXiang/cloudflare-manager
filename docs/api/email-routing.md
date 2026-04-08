# Email Routing API

## Destination Addresses (Account-level)

### List Destination Addresses

```
GET /cf/:accountId/email-routing/addresses
```

**Response:**

```json
[
  {
    "id": "addr-id",
    "email": "user@example.com",
    "verified": "2024-01-15T10:00:00Z",
    "created": "2024-01-15T09:00:00Z",
    "modified": "2024-01-15T10:00:00Z"
  }
]
```

### Add Destination Address

```
POST /cf/:accountId/email-routing/addresses
```

**Request:**

```json
{
  "email": "user@example.com"
}
```

### Delete Destination Address

```
DELETE /cf/:accountId/email-routing/addresses/:addressId
```

## Settings (Zone-level)

### Get Email Routing Settings

```
GET /cf/:accountId/email-routing/zones/:zoneId/settings
```

**Response:**

```json
{
  "enabled": true,
  "name": "example.com",
  "tag": "zone-tag"
}
```

### Enable Email Routing

```
POST /cf/:accountId/email-routing/zones/:zoneId/enable
```

### Disable Email Routing

```
POST /cf/:accountId/email-routing/zones/:zoneId/disable
```

## Routing Rules (Zone-level)

### List Rules

```
GET /cf/:accountId/email-routing/zones/:zoneId/rules
```

**Response:**

```json
[
  {
    "id": "rule-id",
    "name": "Forward info",
    "priority": 0,
    "enabled": true,
    "matchers": [
      { "type": "literal", "field": "to", "value": "info@example.com" }
    ],
    "actions": [
      { "type": "forward", "value": ["admin@gmail.com"] }
    ]
  }
]
```

### Create Rule

```
POST /cf/:accountId/email-routing/zones/:zoneId/rules
```

**Request:**

```json
{
  "name": "Forward info",
  "priority": 0,
  "enabled": true,
  "matchers": [
    { "type": "literal", "field": "to", "value": "info@example.com" }
  ],
  "actions": [
    { "type": "forward", "value": ["admin@gmail.com"] }
  ]
}
```

### Delete Rule

```
DELETE /cf/:accountId/email-routing/zones/:zoneId/rules/:ruleId
```

## Catch-All Rule (Zone-level)

### Get Catch-All Rule

```
GET /cf/:accountId/email-routing/zones/:zoneId/catch-all
```

**Response:**

```json
{
  "enabled": true,
  "matchers": [
    { "type": "all" }
  ],
  "actions": [
    { "type": "forward", "value": ["catchall@gmail.com"] }
  ]
}
```
