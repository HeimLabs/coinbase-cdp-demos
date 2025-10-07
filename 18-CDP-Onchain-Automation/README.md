# CDP Onchain Automation — Autonomous Fee Collector

An autonomous Node.js agent using the Coinbase Developer Platform (CDP) to:

- Provision or reuse managed EVM accounts (receiver + treasury)
- Monitor Base mainnet for incoming USDC transfers to the receiver via the CDP SQL API
- Automatically forward a 5% platform fee from the receiver to the treasury
- Periodically report treasury USDC balance

This demo is production-inspired but intended for tutorial and sandbox use. Review carefully before mainnet use.

## Quickstart

1) Install dependencies

```bash
npm install
```

2) Create environment file

Copy `env.example` to `.env` and fill in values:

```bash
cp env.example .env
```

Required variables:

- `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET`: CDP API credentials
- `CDP_WALLET_SECRET`: encryption secret for CDP SDK
- `CDP_CLIENT_API_KEY`: bearer key for CDP SQL API

3) Build and run

```bash
npm run build
npm start
```

The agent will:

- Ensure receiver and treasury accounts exist
- Test SQL API connectivity
- Start two loops:
  - Payment monitoring (every 10s)
  - Treasury balance reporting (every 60s)

Stop with Ctrl+C.

## Safety Notes

- This demo targets Base mainnet and uses real funds. Test with small amounts first.
- Ensure the receiver has ETH for gas.
- Credentials must only live in `.env` (gitignored). Never commit secrets.

## Files

- `src/agent.ts`: main loop, SQL queries, fee forwarding, balance reporting
- `env.example`: required environment variables

## Scripts

- `npm run build`: TypeScript build to `dist/`
- `npm start`: run compiled agent


