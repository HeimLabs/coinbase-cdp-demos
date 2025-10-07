Base Accounts Demo (Tutorial)
=============================

This is a minimal, tutorial-quality reference that showcases Base Account features with simple code:

- Sign in with Base (client `wallet_connect` + server session)
- Base Pay (one-tap USDC)
- Gas Sponsorship (sponsored NFT mint + estimate) on Base Sepolia
- Batch Transactions (5x NFT mints, gasless) on Base Sepolia
- Sub-Accounts (get or create) on Base Sepolia
- Spend Permissions (Base Mainnet USDC) with a simple demo storage route
- Typed Data Signing

Why this demo?
--------------

Base Accounts (smart accounts) unlock a modern web3 UX: one-tap auth, gasless transactions, batching, sub-accounts, and recurring spend permissions. This demo shows each capability in isolation and end-to-end, so you can copy-paste working patterns into your app.

Prerequisites
-------------

- Node.js v18+
- A Paymaster URL for Base Sepolia (from your provider)

Environment Variables
---------------------

Copy `env.example` to `.env.local` and fill in values:

```
cp env.example .env.local
```

- `NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL` (optional but required for sponsorship features):
  - Example: `https://api.developer.coinbase.com/rpc/v1/base-sepolia/<TOKEN>`
  - Used by `wallet_sendCalls` `capabilities.paymasterService.url`

Quickstart (Dev-Only)
----------

1) Install deps

```
npm install
```

2) Set environment variable

Create `.env.local` with your Paymaster URL (HTTPS):

```
NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL=https://api.developer.coinbase.com/rpc/v1/base-sepolia/REPLACE_ME
```

3) Run the app

```
npm run dev
```

Open `http://localhost:3000`.

Note: This project is intentionally dev-only. There is no production build or deployment path. Any references in code comments to "production" are informational and not used in this tutorial project.

Security: Do not commit `.env*` files. Use `env.example` for reference.

How it works
------------

- Auth: The client calls `wallet_connect` (with a locally generated nonce) and then POSTs `{ address }` to `/api/auth/verify` which sets a simple httpOnly cookie.
- Sponsorship: We call `wallet_sendCalls` with `capabilities.paymasterService.url` set to your Paymaster URL. The NFT contract must be allowlisted with your provider.
- Batching: We send 5 `safeMint` calls in one atomic transaction using EIP-5792 v2 (`version: '2.0.0'`, `atomicRequired: true`).
- Sub-accounts: Use `wallet_getSubAccounts`/`wallet_addSubAccount` to list or create.
- Spend Permissions: Use SDK helpers to request a permission on Base Mainnet USDC and store it via `/api/subscriptions/save` (demo only).

Feature Walkthrough
-------------------

1) Sign in with Base (SIWE)
   - UI: `LoginForm` calls `wallet_connect` with `signInWithEthereum` capability
   - Server: `/api/auth/verify` sets a simple httpOnly session cookie
   - Where: `src/app/components/LoginForm.tsx`, `src/app/api/auth/verify/route.ts`

2) Gas Sponsorship (Paymasters)
   - Calls `wallet_sendCalls` with `capabilities.paymasterService.url`
   - Sends a sponsored `safeMint` call to a tutorial NFT contract on Base Sepolia
   - Where: `src/lib/gasSponsorship.ts`, `src/app/page.tsx`

3) Batch Transactions
   - Uses EIP-5792 v2: `version: '2.0.0'`, `atomicRequired: true`
   - Mints 5 NFTs in a single atomic transaction with gas sponsorship
   - Where: `src/app/page.tsx` (Batch Mint handler)

4) Sub-Accounts
   - `wallet_getSubAccounts`/`wallet_addSubAccount` to list or create isolated accounts
   - Useful to reduce prompts and scope permissions
   - Where: `src/lib/subAccounts.ts`, `src/app/page.tsx`

5) Spend Permissions (USDC on Base mainnet)
   - Requests recurring spend permission, stores it via demo API
   - Where: `src/lib/spendPermissions.ts`, `src/app/api/subscriptions/save/route.ts`

6) Typed Data Signing (EIP-712)
   - Signs structured data for off-chain auth/permits
   - Where: `src/lib/advancedCapabilities.ts`, `src/app/page.tsx`

7) Base Pay (One-Tap Payments)
   - `@base-org/account` `pay` + `getPaymentStatus` (testnet)
   - Where: `src/app/page.tsx`

Networks & Contracts
--------------------

- Base Sepolia (testnet): Gas sponsorship and NFT mint examples
- Base mainnet: USDC spend permissions (requires mainnet access)

Customization
-------------

- Replace the tutorial NFT contract address in `src/app/page.tsx` for your app
- Swap the UI with your design system while keeping the handlers intact
- Replace in-memory stores with your database and proper auth

Paths
-----

- UI: `src/app/page.tsx`, `src/app/components/*`
- Libs: `src/lib/*`
- API: `src/app/api/auth/verify/route.ts`, `src/app/api/subscriptions/save/route.ts`

Scripts
-------

```
npm run dev     # start Next.js dev server
npm run build   # (optional) build (dev tutorial focuses on `dev`)
npm run start   # start production server (if you build)
```

Troubleshooting
---------------

- Missing Paymaster URL: set `NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL` in `.env.local`.
- Paymaster errors: ensure your NFT contract is allowlisted by your provider on Base Sepolia.
- Wallet connect issues: try reconnecting, or clear site data and refresh.

Security Notes
--------------

- Do not commit `.env*` files; `.gitignore` is configured
- Demo auth intentionally simplified; enforce SIWE verification and JWT in production
- Use your own Paymaster proxy; do not embed provider tokens in the client

