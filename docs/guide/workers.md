# Workers

Manage Cloudflare Workers scripts across your accounts.

## Listing Workers

Select an account from the dropdown to see all Workers scripts with their size, creation date, and last modified date.

## Viewing Source Code

Click **VIEW CODE** on any worker to see its full source code in a modal window.

## Deploying a Worker

1. Click **DEPLOY**
2. Enter a script name
3. Paste your Worker code
4. Toggle **ES Module format** if using the module syntax
5. Click **DEPLOY**

Example ES Module Worker:

```javascript
export default {
  async fetch(request) {
    return new Response("Hello from Cloudflare Manager!");
  }
};
```

## Deleting a Worker

Click **DELETE** on any worker card and confirm the deletion.
