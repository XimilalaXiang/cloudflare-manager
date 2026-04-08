# Zones & DNS

Manage domains and DNS records across your Cloudflare accounts.

## Browsing Zones

Select an account to see all zones (domains). Each zone shows its name, status (active/pending), and pause state.

## DNS Record Management

Click on a zone to view its DNS records in a table with type, name, content, TTL, and proxy status.

### Creating a DNS Record

1. Click **ADD RECORD**
2. Select the record type (A, AAAA, CNAME, MX, TXT, NS, SRV, CAA)
3. Enter the name, content, and TTL
4. Toggle **Proxied** if you want Cloudflare proxy
5. Click **CREATE**

### Editing a DNS Record

Click **EDIT** on any record row to modify its properties.

### Deleting a DNS Record

Click **DELETE** on any record row and confirm the deletion.

::: tip
Set TTL to `1` for automatic TTL (recommended when using Cloudflare proxy).
:::
