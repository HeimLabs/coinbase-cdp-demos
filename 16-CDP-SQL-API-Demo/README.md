# CDP SQL API Demo — Query Onchain Data with SQL

This tutorial shows how to query onchain data from the Base network using the Coinbase Developer Platform (CDP) SQL API from a simple Node.js app. You will:

- Configure your CDP API key
- Run a query to fetch the latest block on Base
- Run a whale-watching query to find the largest recent USDC transfers

## Prerequisites

- Node.js v16+
- A CDP API key with access to the SQL API

## Setup

1) Install dependencies:

```bash
npm install
```

2) Create a `.env` file and set your key:

```bash
echo "CDP_CLIENT_API_KEY=YOUR_API_KEY_HERE" > .env
```

If this repo includes a `.env.example`, you can also copy it and fill in values:

```bash
cp .env.example .env
```

3) Run the demo:

```bash
# Runs both demos: latest block + whale watching (10k sample)
npm start

# Latest block only
npm run latest-block

# Whale watching (top 5 USDC transfers from recent sample)
npm run whales

# Optional: smaller or larger sample window
npm run whales:1k
npm run whales:10k
```

## How it works

The app sends SQL queries to the CDP SQL API endpoint:

- `index.js` loads the `CDP_CLIENT_API_KEY` from `.env`
- `runLatestBlockDemo()` queries the latest block from `base.blocks`
- `runWhaleWatchingDemo()` selects recent `Transfer` events for USDC on Base from `base.events`, sorts by value, and prints the top 5

Key files:

- `index.js`: Main CLI entry with two demos
- `package.json`: Helpful scripts for running demos

## Customization

- Change the token by editing `DEFAULT_USDC_BASE_ADDRESS` in `index.js`
- Adjust the sample size with `npm run whales -- <limit>` or use `whales:1k`/`whales:10k`

## Notes

- USDC has 6 decimals. The demo prints both an exact `usdc_exact` string and a human-friendly `usdc_formatted` approximation.
- Results are derived from a recent sample (`LIMIT` clause). Increase the limit to widen the sample.

## Troubleshooting

- "Please set CDP_CLIENT_API_KEY": Ensure `.env` has `CDP_CLIENT_API_KEY` and you restarted the process after changes.
- 401/403 errors: Check that your API key is valid and has required permissions.


