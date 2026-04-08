# 邮件路由 API

## 目标地址（账户级别）

### 列出目标地址

```
GET /cf/:accountId/email-routing/addresses
```

**响应：**

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

### 添加目标地址

```
POST /cf/:accountId/email-routing/addresses
```

**请求：**

```json
{
  "email": "user@example.com"
}
```

### 删除目标地址

```
DELETE /cf/:accountId/email-routing/addresses/:addressId
```

## 设置（域名级别）

### 获取邮件路由设置

```
GET /cf/:accountId/email-routing/zones/:zoneId/settings
```

**响应：**

```json
{
  "enabled": true,
  "name": "example.com",
  "tag": "zone-tag"
}
```

### 启用邮件路由

```
POST /cf/:accountId/email-routing/zones/:zoneId/enable
```

### 禁用邮件路由

```
POST /cf/:accountId/email-routing/zones/:zoneId/disable
```

## 路由规则（域名级别）

### 列出规则

```
GET /cf/:accountId/email-routing/zones/:zoneId/rules
```

**响应：**

```json
[
  {
    "id": "rule-id",
    "name": "转发 info",
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

### 创建规则

```
POST /cf/:accountId/email-routing/zones/:zoneId/rules
```

**请求：**

```json
{
  "name": "转发 info",
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

### 删除规则

```
DELETE /cf/:accountId/email-routing/zones/:zoneId/rules/:ruleId
```

## 全匹配规则（域名级别）

### 获取全匹配规则

```
GET /cf/:accountId/email-routing/zones/:zoneId/catch-all
```

**响应：**

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
