# Social Trivia MiniApp - Full MiniKit Tutorial

A comprehensive Farcaster MiniApp showcasing the complete MiniKit and OnchainKit integration. This one-shot tutorial demonstrates building a fully functional social trivia game with wallet connection, onchain score saving, and Farcaster social features - all in one complete example.

## 🌟 Features

- **Complete MiniKit Integration**: Full implementation of Farcaster Frames with account association
- **OnchainKit Wallet Connection**: Seamless Base Account (Smart Wallet) support
- **Gas-Sponsored Transactions**: Save scores onchain with zero gas fees via Paymaster
- **Interactive Trivia Game**: Web3-themed questions testing blockchain knowledge
- **Compose Cast Integration**: Share your trivia results with friends on Farcaster
- **Background Notifications**: Redis-backed notification system with webhooks
- **Profile Viewing**: Integrated Farcaster profile viewing from leaderboard
- **Onchain Leaderboard**: Smart contract for storing and retrieving scores
- **Modern Mobile UI**: Responsive design optimized for mobile frame experience

## 🎮 Game Features

### Trivia Gameplay
- **5 Questions Per Game**: Curated Web3 and blockchain-themed questions
- **Multiple Choice Answers**: Four options per question
- **Real-time Scoring**: 20 points per correct answer (100 points max)
- **Skip Functionality**: Use primary button to skip difficult questions
- **Progress Tracking**: Visual indication of question progress

### Social Features
- **Leaderboard**: View top scorers with profile pictures and usernames
- **Share Results**: Compose cast to share your score with the Farcaster community
- **Profile Integration**: Click leaderboard entries to view Farcaster profiles
- **User Context**: Display connected user's profile picture and display name

## 🛠️ Tech Stack

- **MiniKit**: Farcaster's mini app framework for embedded experiences
- **OnchainKit**: Coinbase's React components and utilities for onchain apps
- **Next.js 15**: Modern React framework with App Router
- **Farcaster Frame SDK**: Native frame integration and hooks
- **Redis (Upstash)**: Optional background notifications support
- **Wagmi**: React hooks for Ethereum interactions
- **Viem**: TypeScript interface for Ethereum
- **Tailwind CSS**: Utility-first CSS framework
- **Base Sepolia**: Testnet blockchain for safe testing

## 📋 Prerequisites

- Node.js (v18 or later)
- npm, yarn, pnpm, or bun package manager
- Farcaster account for testing the mini app
- OnchainKit API key from [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
- (Optional) Redis instance from [Upstash](https://upstash.com/) for notifications
- (Optional) Base Sepolia testnet ETH for testing

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/HeimLabs/coinbase-cdp-demos.git
cd 19-One-Shot-Full-Miniapp-Tutorial

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Copy the example environment file
cp env.example .env.local
```

Configure the required environment variables:

```env
# Required: OnchainKit Configuration
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=Social Trivia
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ICON_URL=http://localhost:3000/icon.png
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here

# Frame Metadata (generate with: npx create-onchain --manifest)
FARCASTER_HEADER=
FARCASTER_PAYLOAD=
FARCASTER_SIGNATURE=
NEXT_PUBLIC_APP_ICON=http://localhost:3000/icon.png
NEXT_PUBLIC_APP_SUBTITLE=Test your Web3 knowledge
NEXT_PUBLIC_APP_DESCRIPTION=Play trivia and save your score onchain
NEXT_PUBLIC_APP_SPLASH_IMAGE=http://localhost:3000/splash.png
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=#1a1a1a
NEXT_PUBLIC_APP_PRIMARY_CATEGORY=game
NEXT_PUBLIC_APP_HERO_IMAGE=http://localhost:3000/hero.png
NEXT_PUBLIC_APP_TAGLINE=Social Trivia - Test Your Web3 Knowledge
NEXT_PUBLIC_APP_OG_TITLE=Social Trivia
NEXT_PUBLIC_APP_OG_DESCRIPTION=Play trivia and save your score onchain
NEXT_PUBLIC_APP_OG_IMAGE=http://localhost:3000/hero.png

# Optional: Paymaster (enables gas-sponsored transactions)
NEXT_PUBLIC_PAYMASTER_URL=

# Optional: Redis (enables background notifications)
REDIS_URL=
REDIS_TOKEN=
```

### 3. Get Your OnchainKit API Key

1. Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Sign in or create an account
3. Create a new project
4. Copy your API key and add it to `.env.local`

### 4. Generate Frame Manifest (Optional)

To enable Farcaster account association and notifications:

```bash
# Generate frame manifest with account association
npx create-onchain --manifest
```

This will update your environment variables with the proper Farcaster headers.

### 5. Start the Development Server

```bash
npm run dev
# or
yarn dev
# or  
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the mini app.

## 🎯 How to Play

### Starting the Game

1. **Launch the App**: Open the mini app in Farcaster or your browser
2. **Connect Wallet** (Optional): Connect your Base Account to save scores onchain
3. **Click "Start Game"**: Begin your trivia challenge
4. **Add to Favorites** (Optional): Save the frame to your Farcaster account

### Playing Trivia

1. **Read the Question**: Each question has 4 multiple choice answers
2. **Select Your Answer**: Tap on your chosen answer
3. **Progress Through**: Answer all 5 questions to complete the game
4. **Skip if Needed**: Use the "Skip Question" primary button for difficult questions

### After Completing

1. **View Your Score**: See your final score out of 100 points
2. **Share Result**: Use "Share Result" to cast your score to Farcaster
3. **Save Onchain**: Click "Save Score Onchain" to permanently record your score (requires wallet connection)
4. **View Leaderboard**: Check how you rank against other players
5. **Play Again**: Start a new game with shuffled questions

## 🏗️ Technical Architecture

### MiniKit Integration

The app leverages MiniKit's full capability stack:

```typescript
// MiniKit Provider Setup
<OnchainKitProvider
  miniKit={{ enabled: true }}
  config={{
    paymaster: process.env.NEXT_PUBLIC_PAYMASTER_URL,
  }}
>
  {children}
</OnchainKitProvider>
```

### Core Components

1. **TriviaGame.tsx**: Main game logic and state management
2. **QuestionScreen.tsx**: Individual question display and answer handling
3. **ResultsScreen.tsx**: Score display and onchain saving functionality
4. **Leaderboard.tsx**: Display top scorers with profile integration
5. **AppLayout.tsx**: Shared layout with mobile optimization

### MiniKit Hooks Used

```typescript
// Frame lifecycle management
const { setFrameReady, isFrameReady, context } = useMiniKit();

// Primary button configuration
usePrimaryButton({ text: 'Start Game' }, () => startNewGame());

// Social features
const { composeCast } = useComposeCast();
const viewProfile = useViewProfile();
const closeFrame = useClose();
const addFrame = useAddFrame();
```

### Smart Contract Integration

The app interacts with a Leaderboard contract on Base Sepolia:

**Contract Address**: `0x3f9F825af4d6B5058b4B06CE300325aD7449B835`

```typescript
// Saving score to the leaderboard
<Transaction
  chainId={baseSepolia.id}
  calls={[{
    address: "0x3f9F825af4d6B5058b4B06CE300325aD7449B835",
    abi: LEADERBOARD_ABI,
    functionName: 'addScore',
    args: [BigInt(score)],
  }]}
  isSponsored={true}  // Gas-sponsored via Paymaster
>
  <TransactionButton text="Save Score Onchain 🏆" />
</Transaction>
```

**Contract ABI**:
```solidity
function addScore(uint256 score) external;
```

### Project Structure

```
19-One-Shot-Full-Miniapp-Tutorial/
├── app/
│   ├── api/
│   │   ├── notify/route.ts         # Notification endpoint
│   │   └── webhook/route.ts        # Webhook handler for frame events
│   ├── components/
│   │   ├── AppLayout.tsx           # Shared layout wrapper
│   │   ├── TriviaGame.tsx          # Main game controller
│   │   ├── QuestionScreen.tsx      # Question display
│   │   ├── ResultsScreen.tsx       # Results & onchain saving
│   │   └── Leaderboard.tsx         # Leaderboard display
│   ├── page.tsx                    # Entry point
│   ├── layout.tsx                  # Frame metadata & providers
│   ├── providers.tsx               # OnchainKit configuration
│   ├── globals.css                 # Global styles
│   └── theme.css                   # OnchainKit theme customization
├── lib/
│   ├── trivia-data.ts              # Question database
│   ├── notification.ts             # Notification utilities
│   ├── notification-client.ts      # Client-side notifications
│   └── redis.ts                    # Redis configuration
├── public/                         # Frame assets (icons, images)
├── env.example                     # Environment template
└── package.json                    # Dependencies
```

## 🎨 Customization Guide

### Adding Your Own Questions

Edit `lib/trivia-data.ts`:

```typescript
const triviaQuestions: TriviaQuestion[] = [
  {
    id: '1',
    question: "Your question here?",
    answers: [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    correctAnswer: 1,  // Index of correct answer (0-3)
    category: "Web3",
    difficulty: "easy",
    source: "https://example.com/source"
  },
  // Add more questions...
];
```

### Customizing Scoring

Modify the scoring logic in `TriviaGame.tsx`:

```typescript
const handleAnswer = (isCorrect: boolean) => {
  if (isCorrect) {
    setScore(score + 20);  // Change points per question
  }
  // ...
};
```

### Deploying Your Own Contract

1. Deploy a contract with an `addScore(uint256)` function
2. Update the contract address in `ResultsScreen.tsx`:

```typescript
const CONTRACT_ADDRESS = "0xYourNewContractAddress";
```

### Customizing Theme

Update `app/theme.css` for custom colors and styles:

```css
:root {
  --ock-bg-default: #1a1a1a;
  --ock-bg-alternate: #2a2a2a;
  --ock-text-default: #ffffff;
  --ock-accent: #3b82f6;
}
```

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**: Commit your changes and push to GitHub
2. **Import to Vercel**: Go to [Vercel](https://vercel.com/) and import your repository
3. **Add Environment Variables**: Copy all variables from `.env.local` to Vercel
4. **Update URLs**: Change `NEXT_PUBLIC_URL` to your Vercel URL
5. **Deploy**: Click deploy and wait for completion

### Share Your Frame

1. **Get Your URL**: Copy your deployed Vercel URL
2. **Create a Cast**: Post a cast on Farcaster with your frame URL
3. **Test the Frame**: Click the "Launch" button in your cast
4. **Share with Community**: Let others play and share their scores

## 💡 Learning Points

This tutorial demonstrates:

### MiniKit Concepts
- Frame lifecycle management with `useMiniKit()`
- Primary button configuration with `usePrimaryButton()`
- Social features: compose cast, view profile, add frame
- Frame context and user data access
- Account association and webhooks

### OnchainKit Features
- Wallet connection with Base Account support
- Transaction components for onchain interactions
- Identity components (Avatar, Name)
- Gas sponsorship via Paymaster
- Transaction status monitoring

### Best Practices
- Secure context usage (display only, not authorization)
- Error handling and loading states
- Mobile-first responsive design
- Environment variable management
- Smart contract integration patterns

## 🔧 Development

### Available Scripts

- `npm run dev`: Start development server on http://localhost:3000
- `npm run build`: Build for production  
- `npm run start`: Start production server
- `npm run lint`: Run ESLint for code quality

### Testing Your Frame

1. **Local Testing**: Use the development server at http://localhost:3000
2. **ngrok Testing**: Use ngrok for testing in Farcaster:
   ```bash
   ngrok http 3000
   ```
3. **Frame Validator**: Use Farcaster's frame validator tools
4. **Mobile Testing**: Test on actual mobile devices within Farcaster client

### Debugging Tips

- **Check Console**: Look for MiniKit initialization logs
- **Verify Environment Variables**: Ensure all required vars are set
- **Test Wallet Connection**: Try connecting with different wallet types
- **Monitor Transactions**: Use Base Sepolia block explorer
- **Redis Optional**: App works without Redis, just no notifications

## 📖 Additional Resources

### Documentation
- [MiniKit Documentation](https://docs.base.org/builderkits/minikit/overview)
- [OnchainKit Documentation](https://onchainkit.xyz/)
- [Farcaster Frame SDK](https://docs.farcaster.xyz/reference/frames/spec)
- [CDP Documentation](https://docs.cdp.coinbase.com/)
- [Base Network Documentation](https://docs.base.org/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)

### Tools & Services
- [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
- [Upstash Redis](https://upstash.com/)
- [Base Sepolia Faucet](https://portal.cdp.coinbase.com/products/faucet)
- [Base Sepolia Explorer](https://sepolia.basescan.org/)

### Community
- [Base Discord](https://discord.gg/buildonbase)
- [Farcaster Developer Discord](https://discord.gg/farcaster)
- [Coinbase Developer Platform Discord](https://discord.gg/cdp)

## 🔒 Security Notes

- **Never commit sensitive data**: Keep `.env.local` in `.gitignore`
- **Use testnet first**: Always test on Base Sepolia before mainnet
- **Validate context**: Never use unverified context for authorization
- **Rate limiting**: Implement for production API endpoints
- **Monitor gas sponsorship**: Set limits to prevent abuse
- **HTTPS required**: Use HTTPS for production deployments
- **Webhook verification**: Verify FID ownership in webhook handlers

## ❓ Troubleshooting

### Common Issues

**Frame not loading?**
- Check that all environment variables are set correctly
- Verify your OnchainKit API key is valid
- Ensure your URL is accessible (use ngrok for local testing)

**Wallet won't connect?**
- Try refreshing the frame
- Check that you're on the correct network (Base)
- Verify Paymaster URL is set (optional but recommended)

**Transaction failing?**
- Ensure you have Base Sepolia ETH (get from faucet)
- Check that the contract address is correct
- Verify the transaction parameters

**Notifications not working?**
- Notifications are optional and require Redis setup
- Check REDIS_URL and REDIS_TOKEN are set correctly
- Verify webhook is accessible from internet

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-questions`)
3. Commit your changes (`git commit -m 'Add new trivia questions'`)
4. Push to the branch (`git push origin feature/new-questions`)
5. Open a Pull Request

---

**Disclaimer**: This project is for educational and demonstration purposes. For production use, additional security measures, testing, and monitoring should be implemented. Always test thoroughly on testnets before deploying to mainnet.

---

Built with ❤️ using [MiniKit](https://docs.base.org/builderkits/minikit/overview) and [OnchainKit](https://onchainkit.xyz/)
