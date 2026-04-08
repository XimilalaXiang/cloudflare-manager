# Account Management

Cloudflare Manager supports managing multiple Cloudflare accounts from a single interface.

## Adding an Account

1. Navigate to **ACCOUNTS**
2. Click **ADD ACCOUNT**
3. Fill in the form:
   - **Name** — A display name for the account
   - **Email** — Associated email (optional)
   - **Account ID** — Your Cloudflare Account ID
   - **API Token** — A Cloudflare API token with appropriate permissions

The API token is verified against Cloudflare's API before being stored. It's encrypted with AES-256-GCM and never returned in API responses — only a masked version is shown.

## Editing an Account

Click the **EDIT** button on any account to modify its name, email, or API token. Leave the token field blank to keep the current token.

## Verifying an Account

Click **VERIFY** to check that the stored API token is still valid against Cloudflare.

## Deleting an Account

Click **DELETE** to soft-delete an account. This does not affect your actual Cloudflare account.

## Security

- API tokens are encrypted at rest using AES-256-GCM
- Tokens are never exposed in API responses (masked as `cfut****xxxx`)
- Each account is isolated — switching between accounts in the UI shows only that account's resources
