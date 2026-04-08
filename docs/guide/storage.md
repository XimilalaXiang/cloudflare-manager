# Storage (KV / D1 / R2)

The Storage page provides unified management for Cloudflare's three storage services.

## KV Storage

### Namespaces
- **Create** — Click **CREATE NAMESPACE** and enter a name
- **Delete** — Click **DELETE** on any namespace
- **Browse Keys** — Click **KEYS** to list all keys in a namespace

### Key-Value Operations
- **View** — Click a key to view its value in a modal
- **Add** — Click **ADD KEY** to create a new key-value pair
- **Delete** — Click **DELETE** on any key

## D1 Database

### Databases
- **Create** — Click **CREATE DATABASE** and enter a name
- **Delete** — Click **DELETE** on any database
- **Query** — Click **QUERY** to open the SQL console

### SQL Console
Enter SQL queries and click **RUN** to execute them against the selected D1 database. Results are displayed as formatted JSON.

```sql
SELECT * FROM sqlite_master;
```

## R2 Storage

### Buckets
- **Create** — Click **CREATE BUCKET**, enter a name and optional location
- **Delete** — Click **DELETE** on any bucket

Available locations: `wnam` (Western North America), `enam` (Eastern North America), `weur` (Western Europe), `eeur` (Eastern Europe), `apac` (Asia Pacific).
