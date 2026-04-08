# API Reference

All endpoints (except login) require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

Base URL: `http://localhost:8080/api`

## Endpoints Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Current user info |
| POST | `/auth/change-password` | Change password |

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accounts` | List accounts |
| POST | `/accounts` | Create account |
| GET | `/accounts/:id` | Get account |
| PUT | `/accounts/:id` | Update account |
| DELETE | `/accounts/:id` | Delete account |
| POST | `/accounts/:id/verify` | Verify account token |

### Workers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cf/:accountId/workers` | List workers |
| POST | `/cf/:accountId/workers` | Deploy worker |
| GET | `/cf/:accountId/workers/:name` | Get worker code |
| DELETE | `/cf/:accountId/workers/:name` | Delete worker |
| GET | `/cf/:accountId/workers/:name/versions` | List versions |
| GET | `/cf/:accountId/workers/:name/deployments` | Get deployments |

### Zones & DNS
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cf/:accountId/zones` | List zones |
| GET | `/cf/:accountId/zones/:zoneId` | Get zone |
| GET | `/cf/:accountId/zones/:zoneId/dns` | List DNS records |
| POST | `/cf/:accountId/zones/:zoneId/dns` | Create DNS record |
| PUT | `/cf/:accountId/zones/:zoneId/dns/:id` | Update DNS record |
| DELETE | `/cf/:accountId/zones/:zoneId/dns/:id` | Delete DNS record |

### Worker Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cf/:accountId/zones/:zoneId/routes` | List routes |
| POST | `/cf/:accountId/zones/:zoneId/routes` | Create route |
| DELETE | `/cf/:accountId/zones/:zoneId/routes/:id` | Delete route |

### Pages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cf/:accountId/pages/projects` | List projects |
| POST | `/cf/:accountId/pages/projects` | Create project |
| GET | `/cf/:accountId/pages/projects/:name` | Get project |
| DELETE | `/cf/:accountId/pages/projects/:name` | Delete project |
| GET | `/cf/:accountId/pages/projects/:name/deployments` | List deployments |
| DELETE | `/cf/:accountId/pages/projects/:name/deployments/:id` | Delete deployment |

### KV Storage
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cf/:accountId/kv/namespaces` | List KV namespaces |
| POST | `/cf/:accountId/kv/namespaces` | Create namespace |
| DELETE | `/cf/:accountId/kv/namespaces/:id` | Delete namespace |
| GET | `/cf/:accountId/kv/namespaces/:id/keys` | List keys |
| GET | `/cf/:accountId/kv/namespaces/:id/keys/:key` | Get value |
| PUT | `/cf/:accountId/kv/namespaces/:id/keys/:key` | Put value |
| DELETE | `/cf/:accountId/kv/namespaces/:id/keys/:key` | Delete key |

### D1 Database
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cf/:accountId/d1/databases` | List D1 databases |
| POST | `/cf/:accountId/d1/databases` | Create database |
| DELETE | `/cf/:accountId/d1/databases/:id` | Delete database |
| POST | `/cf/:accountId/d1/databases/:id/query` | SQL query |

### R2 Storage
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cf/:accountId/r2/buckets` | List R2 buckets |
| POST | `/cf/:accountId/r2/buckets` | Create bucket |
| DELETE | `/cf/:accountId/r2/buckets/:name` | Delete bucket |

### Email Routing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cf/:accountId/email-routing/addresses` | List destination addresses |
| POST | `/cf/:accountId/email-routing/addresses` | Add destination address |
| DELETE | `/cf/:accountId/email-routing/addresses/:id` | Delete destination address |
| GET | `/cf/:accountId/email-routing/zones/:zoneId/settings` | Get settings |
| POST | `/cf/:accountId/email-routing/zones/:zoneId/enable` | Enable |
| POST | `/cf/:accountId/email-routing/zones/:zoneId/disable` | Disable |
| GET | `/cf/:accountId/email-routing/zones/:zoneId/rules` | List rules |
| POST | `/cf/:accountId/email-routing/zones/:zoneId/rules` | Create rule |
| DELETE | `/cf/:accountId/email-routing/zones/:zoneId/rules/:id` | Delete rule |
| GET | `/cf/:accountId/email-routing/zones/:zoneId/catch-all` | Get catch-all |

## Error Format

```json
{
  "error": "description of what went wrong"
}
```

| Code | Meaning |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |
