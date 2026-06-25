# @fluxapay/sdk

Official TypeScript SDK for interacting with FluxaPay's Soroban smart contracts on the Stellar network.

## Installation

```bash
npm install @fluxapay/sdk
```

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## Quick Start

```typescript
import { FluxapayClient } from "@fluxapay/sdk";

const client = new FluxapayClient({
  network: "testnet",
  rpcUrl: "https://soroban-testnet.stellar.org",
  contractId: "C...", // Your contract ID
});

async function main() {
  // Create a payment
  const payment = await client.createPayment({
    paymentId: "pay_123",
    merchantId: "G...",
    amount: 1000000n, // 1 USDC
    currency: "USDC",
    depositAddress: "G...",
    expiresAt: BigInt(Math.floor(Date.now() / 1000) + 3600),
  });

  console.log("Payment created:", payment);

  // Get payment status
  const status = await client.getPayment("pay_123");
  console.log("Payment status:", status);
}
```

## Features

- **High-level Wrapper**: `FluxapayClient`, `RefundManagerClient`, `MerchantRegistryClient`, and `FxOracleClient` simplify complex contract interactions.
- **Typed Interfaces**: Full TypeScript support for all contract models (`Merchant`, `Payment`, `Refund`, etc.).
- **Automatic Simulation**: Built-in support for Soroban transaction simulation.
- **Network Presets**: Easy switching between `testnet` and `mainnet`.

## RefundManagerClient

The `RefundManagerClient` provides methods for managing refunds:

```typescript
import { RefundManagerClient } from "@fluxapay/sdk";

const refundClient = new RefundManagerClient({
  network: "testnet",
  rpcUrl: "https://soroban-testnet.stellar.org",
  contractId: "C...", // RefundManager contract ID
});

async function handleRefund() {
  // Create a refund request
  const refundId = await refundClient.createRefund(
    "payment_123",     // paymentId
    500000n,           // refundAmount in stroops
    "Damaged goods",   // reason
    "G...",            // requester address
  );

  console.log("Refund created:", refundId);

  // Get refund details
  const refund = await refundClient.getRefund(refundId);
  console.log("Refund status:", refund.status);

  // Process the refund
  await refundClient.processRefund("G...", refundId); // operator, refundId

  // Get all refunds for a payment
  const allRefunds = await refundClient.getPaymentRefunds("payment_123");
  console.log("Payment refunds:", allRefunds);
}
```

## MerchantRegistryClient

The `MerchantRegistryClient` provides methods for managing merchant registrations:

```typescript
import { MerchantRegistryClient } from "@fluxapay/sdk";

const merchantClient = new MerchantRegistryClient({
  network: "testnet",
  rpcUrl: "https://soroban-testnet.stellar.org",
  contractId: "C...", // MerchantRegistry contract ID
});

async function manageMerchant() {
  // Register a new merchant
  await merchantClient.registerMerchant(
    "merchant_001",      // merchantId
    "Acme Corp",         // businessName
    "USDC",              // settlementCurrency
  );

  console.log("Merchant registered");

  // Get merchant details
  const merchant = await merchantClient.getMerchant("merchant_001");
  console.log("Merchant:", merchant);

  // Verify the merchant
  await merchantClient.verifyMerchant("G...", "merchant_001"); // operator, merchantId

  // Update merchant information
  await merchantClient.updateMerchant(
    "G...",              // operator
    "merchant_001",      // merchantId
    "Updated Corp Name", // new businessName
    "EUR",               // new settlementCurrency
  );

  // Suspend a merchant if needed
  await merchantClient.suspendMerchant("G...", "merchant_001");

  // Reinstate a suspended merchant
  await merchantClient.reinstateMerchant("G...", "merchant_001");
}
```

## FxOracleClient

The `FxOracleClient` provides methods for querying and publishing FX exchange rates. Off-chain services such as settlement processors and dashboards use it to read current rates and check staleness.

### Standalone client

```typescript
import { FxOracleClient } from "@fluxapay/sdk";

const oracleClient = new FxOracleClient({
  network: "testnet",
  rpcUrl: "https://soroban-testnet.stellar.org",
  oracleContractId: "C...", // FX Oracle contract ID
});

async function queryRates() {
  // Read the current rate for a currency pair
  const rate = await oracleClient.getRate("USDCNGN");
  console.log("Rate:", rate.rate, "decimals:", rate.decimals);

  // Convert USDC to a settlement currency
  const settlementAmount = await oracleClient.getSettlementAmount(
    1_000_000n, // 1 USDC in stroops
    "NGN",
  );
  console.log("Settlement amount:", settlementAmount);

  // Check the staleness threshold (seconds)
  const threshold = await oracleClient.getStalenessThreshold();
  console.log("Staleness threshold:", threshold);
}
```

### Via FluxapayClient

Pass `oracleContractId` in `FluxapayConfig` to access the FX Oracle through the main client:

```typescript
import { FluxapayClient } from "@fluxapay/sdk";

const client = new FluxapayClient({
  network: "testnet",
  contractId: "C...", // PaymentProcessor contract ID
  oracleContractId: "C...", // FX Oracle contract ID
});

const oracle = client.fxOracle();
const rate = await oracle.getRate("USDCNGN");
```

### Publishing rates (operator)

```typescript
// Publish a new rate (requires ORACLE role)
await oracleClient.setRate(
  "G...",        // operator address
  "USDCNGN",     // pair
  1_500_0000000n, // rate
  7,             // decimals
);

// Update staleness threshold (requires ADMIN role)
await oracleClient.setStalenessThreshold(
  "G...",   // admin address
  86_400n,  // 24 hours in seconds
);
```

## License

MIT

## Publishing

Releases are published to npm when a version tag is pushed:

```bash
git tag sdk/v0.1.0
git push origin sdk/v0.1.0
```

The [SDK Release](https://github.com/MetroLogic/fluxapay_contract/actions/workflows/sdk-release.yml) workflow builds, tests, and publishes `@fluxapay/sdk`. Requires `NPM_TOKEN` in GitHub repository secrets (npm automation token with publish access to the `@fluxapay` scope).
