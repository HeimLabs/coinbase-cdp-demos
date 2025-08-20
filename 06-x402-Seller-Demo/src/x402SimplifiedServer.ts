import express from 'express';
import { paymentMiddleware } from 'x402-express';

const app = express();
const PORT = 3001;

// The address that will receive the payment
const myPaymentAddress = '0x92C60F91ECE8D4593680F818149ae32144605D0D';

// ================================================
// THE MAGIC: Add the x402 payment middleware
// ================================================
app.use(
  paymentMiddleware(
    myPaymentAddress,
    {
      // Configure the price for your API route
      'GET /api/data': {
        price: '$0.01', // Charge 0.01 USDC
        network: 'base-sepolia',
      },
    },
    {
      // The facilitator service that helps coordinate the payment
      url: 'https://x402.coinbase.com/facilitator',
    },
  ),
);

app.get('/api/data', (req, res) => {
  console.log(`[Server] Access granted for /api/data`);
  res.send({
    message: 'This is the secret, paid data!',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`✅ x402 Protected Server running on http://localhost:${PORT}`);
  console.log(`   - GET /api/data now requires a payment.`);
});