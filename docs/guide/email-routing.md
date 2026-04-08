# Email Routing

Cloudflare Email Routing lets you create custom email addresses for your domain and route incoming emails to any destination mailbox — all for free.

## Overview

Email Routing is a **zone-level** feature. You select a zone (domain) and manage:

- **Settings** — enable or disable email routing for the zone
- **Routing Rules** — define which addresses forward to which destinations
- **Catch-All Rule** — handle emails that don't match any specific rule
- **Destination Addresses** — manage verified destination mailboxes (account-level)

## Managing Email Routing

### 1. Select Account & Zone

Choose a Cloudflare account, then select a zone. Email routing settings and rules are per-zone.

### 2. Destination Addresses

Before creating routing rules, add destination addresses at the account level. Each address receives a verification email from Cloudflare.

### 3. Enable Email Routing

Toggle email routing on/off for the selected zone.

### 4. Create Rules

Each rule has:
- **Matchers** — conditions to match incoming emails (e.g., recipient address)
- **Actions** — what to do with matched emails (e.g., forward to a destination)
- **Priority** — rules are evaluated in priority order

### 5. Catch-All

The catch-all rule handles emails that don't match any specific rule. View its current configuration from the dashboard.

## API Endpoints

See the [Email Routing API Reference](/api/email-routing) for full endpoint documentation.
