# CDP Wallets Policies Demo

A demonstration of how to create and apply policies to Coinbase Developer Platform (CDP) wallets to control transaction permissions. This project shows how to implement account-level policies that can restrict transactions based on various criteria like ETH value limits and destination addresses.

## 🌟 Features

- **Account-Level Policies**: Create policies that apply to entire wallet accounts
- **Transaction Restrictions**: Control transactions based on ETH value and destination addresses
- **Policy Testing**: Test policy enforcement with compliant and violating transactions
- **Faucet Integration**: Request testnet funds for testing
- **Transaction Monitoring**: Track transaction confirmations on Base Sepolia
- **TypeScript**: Full TypeScript implementation for type safety

## 🛠️ Tech Stack

- **Node.js**: JavaScript runtime environment
- **TypeScript**: Type-safe JavaScript superset
- **Coinbase CDP SDK**: For wallet management and policy creation
- **Viem**: Ethereum interactions and transaction handling
- **Base Sepolia**: Testnet for development and testing

## 📋 Prerequisites

- Node.js (v16 or later)
- npm or yarn package manager
- Coinbase Developer Platform (CDP) API credentials
- Base Sepolia testnet access

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/HeimLabs/coinbase-cdp-demos.git
cd 08-CDP-Wallets-Policies-Demo

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file and add your CDP credentials:

```env
# Coinbase Developer Platform API Keys
CDP_API_KEY_ID=your_cdp_api_key_id
CDP_API_KEY_SECRET=your_cdp_api_key_secret
CDP_WALLET_SECRET=your_cdp_wallet_secret
```

### 3. Build and Run

```bash
# Build the TypeScript code
npm run build

# Run the demo
npm start
```

## 🔧 How It Works

The demo demonstrates the following policy management workflow:

1. **Account Creation**: Create or retrieve a CDP wallet account
2. **Policy Definition**: Define rules for transaction restrictions
3. **Policy Application**: Apply the policy to the wallet account
4. **Account Funding**: Fund the account from the Base Sepolia faucet
5. **Compliant Transaction**: Test a transaction that meets policy criteria
6. **Policy Violation**: Test a transaction that violates the policy

### Policy Structure

The demo creates a policy with the following rules:

```typescript
const policyDefinition = {
  policy: {
    scope: "account",
    description: "Account level policy",
    rules: [
      {
        action: "accept",
        operation: "signEvmTransaction",
        criteria: [
          {
            type: "ethValue",
            ethValue: "10000000000000", // 0.00001 ETH in wei
            operator: "<=",
          },
          {
            type: "evmAddress",
            addresses: [safeAddress],
            operator: "in",
          },
        ],
      },
    ],
  },
};
```

This policy:
- Allows transactions with ETH value ≤ 0.00001 ETH
- Restricts transactions to specific safe addresses
- Blocks any transaction that doesn't meet both criteria

## 📊 Example Output

When you run the demo, you'll see output like:

```
Using account: 0x123...abc
Created account-level policy: policy-456...def

Applied policy policy-456...def to account: 0x123...abc
Updated account policies: { accountPolicy: 'policy-456...def' }

Funding account from faucet...
Account funded!

Testing policy with transaction (0.000001 ETH to safe address)...
✅ Transaction confirmed! Explorer: https://sepolia.basescan.org/tx/0xabc...def

Testing policy violation (0.002 ETH - exceeds limit)...
✅ Policy correctly blocked transaction!
```

## 🏗️ Code Structure

### Main Components

1. **Policy Creation**
   ```typescript
   const newPolicy = await cdp.policies.createPolicy(policyDefinition);
   ```

2. **Policy Application**
   ```typescript
   const updatedAccount = await cdp.evm.updateAccount({
     address: account.address,
     update: { accountPolicy: newPolicy.id }
   });
   ```

3. **Transaction Testing**
   ```typescript
   await cdp.evm.sendTransaction({
     address: account.address,
     network: "base-sepolia",
     transaction: {
       to: safeAddress,
       value: parseEther("0.0000001"),
     },
   });
   ```

## 🔒 Policy Types and Criteria

### Supported Policy Scopes
- **Account**: Applies to all transactions from the account
- **Transaction**: Applies to individual transactions (not shown in demo)

### Supported Criteria Types

1. **ETH Value Restrictions**
   ```typescript
   {
     type: "ethValue",
     ethValue: "1000000000000000000", // 1 ETH in wei
     operator: "<=" // or ">=", "==", "!="
   }
   ```

2. **Address Restrictions**
   ```typescript
   {
     type: "evmAddress",
     addresses: ["0x123...abc", "0x456...def"],
     operator: "in" // or "not_in"
   }
   ```

3. **Time-based Restrictions** (not shown in demo)
   ```typescript
   {
     type: "timeWindow",
     startTime: "2024-01-01T00:00:00Z",
     endTime: "2024-12-31T23:59:59Z",
     operator: "within"
   }
   ```

## 🧪 Testing Scenarios

### Compliant Transaction
- **Amount**: 0.0000001 ETH (below 0.00001 ETH limit)
- **Destination**: Safe address (in allowed addresses)
- **Result**: ✅ Transaction approved and executed

### Policy Violation
- **Amount**: 0.0015 ETH (exceeds 0.00001 ETH limit)
- **Destination**: Safe address (in allowed addresses)
- **Result**: ❌ Transaction blocked by policy

## 🔧 Configuration

### Environment Variables

- `CDP_API_KEY_ID`: Your CDP API key identifier
- `CDP_API_KEY_SECRET`: Your CDP API key secret
- `CDP_WALLET_SECRET`: Your CDP wallet secret for encryption

### Customization

You can customize the policy by modifying the `policyDefinition` object:

```typescript
// Example: Higher ETH limit
ethValue: "100000000000000000", // 0.1 ETH in wei

// Example: Different safe address
const safeAddress = "0xYourSafeAddress";

// Example: Multiple allowed addresses
addresses: [
  "0xAddress1",
  "0xAddress2",
  "0xAddress3"
]
```

## 📖 Use Cases

- **Treasury Management**: Control spending limits for organizational wallets
- **Risk Management**: Prevent unauthorized large transactions
- **Compliance**: Ensure transactions meet regulatory requirements
- **Multi-sig Alternatives**: Implement spending controls without multi-sig complexity
- **Developer Tools**: Test transaction restrictions in development environments

## 🛠️ Development

### Available Scripts

- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Run the demo application
- `npm test`: Run tests (not implemented)

### Adding New Policy Types

To test different policy configurations:

1. Modify the `policyDefinition` object in `main.ts`
2. Add new criteria types or operators
3. Test with different transaction scenarios
4. Update the safe address and ETH limits as needed

### Advanced Policy Examples

```typescript
// Multiple criteria (AND logic)
criteria: [
  {
    type: "ethValue",
    ethValue: "1000000000000000000", // 1 ETH
    operator: "<=",
  },
  {
    type: "evmAddress",
    addresses: allowedAddresses,
    operator: "in",
  },
  // Add more criteria as needed
]

// Different actions
action: "reject", // Block transactions instead of accept
```

## 🔒 Security Features

- **Cryptographic Verification**: All policies are cryptographically enforced
- **Immutable Rules**: Policies cannot be bypassed once applied
- **Audit Trail**: All policy actions are logged and traceable
- **Granular Control**: Fine-grained control over transaction permissions

## 🚀 Production Considerations

For production use, consider:

1. **Policy Versioning**: Implement policy update mechanisms
2. **Emergency Procedures**: Plan for policy removal in emergencies
3. **Multi-level Policies**: Combine account and transaction-level policies
4. **Monitoring**: Implement alerts for policy violations
5. **Backup Strategies**: Have fallback accounts for critical operations

## 🛠️ Troubleshooting

### Common Issues

1. **Policy Creation Fails**: Check CDP API credentials and permissions
2. **Transaction Blocked Unexpectedly**: Review policy criteria and test values
3. **Faucet Fails**: Ensure sufficient faucet availability on Base Sepolia
4. **Account Not Found**: Verify account name and creation process

### Debug Tips

- Check console logs for detailed error messages
- Verify ETH values are in wei format
- Ensure addresses are valid and checksummed
- Test with minimal policy restrictions first

## 📖 Additional Resources

- [CDP Policies Documentation](https://docs.cdp.coinbase.com/wallet-api/docs/policies)
- [CDP SDK Documentation](https://docs.cdp.coinbase.com/cdp-sdk/docs/welcome)
- [Base Sepolia Documentation](https://docs.base.org/tools/network-faucets)
- [Viem Documentation](https://viem.sh/)

## 🔒 Security Notes

- Never commit your `.env` file or expose private keys
- Use testnet for development and testing
- Review policy implications before applying to production accounts
- Implement proper access controls for policy management
- Regularly audit and update policies as needed

## 📄 License

This project is licensed under the ISC License.

---

**Disclaimer**: This project is for demonstration purposes. For production use, additional security measures, monitoring, and testing should be implemented.

---

Built with ❤️ using [Coinbase Developer Platform](https://docs.cdp.coinbase.com/) and [Viem](https://viem.sh/).
