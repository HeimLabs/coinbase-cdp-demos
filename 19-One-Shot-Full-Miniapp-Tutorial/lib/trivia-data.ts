// lib/trivia-data.ts

/**
 * TriviaQuestion interface defines the structure for each trivia question
 * 
 * @property id - Unique identifier for the question
 * @property question - The question text displayed to the user
 * @property answers - Array of 4 possible answers (always provide exactly 4)
 * @property correctAnswer - Index of the correct answer (0-3)
 * @property category - Category of the question (e.g., "Web3", "Blockchain")
 * @property difficulty - Difficulty level: 'easy', 'medium', or 'hard'
 * @property source - Optional URL to source documentation or reference
 */
export interface TriviaQuestion {
    id: string;
    question: string;
    answers: string[];
    correctAnswer: number;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    source?: string;
  }
  
  // Database of trivia questions - Add your own questions here!
  // Questions are shuffled randomly when the game starts
  const triviaQuestions: TriviaQuestion[] = [
    {
      id: '1',
      question: "What does 'DAO' stand for in Web3?",
      answers: [
        "Digital Asset Organization",
        "Decentralized Autonomous Organization",
        "Distributed Application Operation",
        "Direct Access Online"
      ],
      correctAnswer: 1,
      category: "Web3",
      difficulty: "easy",
      source: "https://ethereum.org/en/dao/"
    },
    {
      id: '2',
      question: "Which blockchain is Base built on?",
      answers: ["Bitcoin", "Solana", "Ethereum", "Polygon"],
      correctAnswer: 2,
      category: "Blockchain",
      difficulty: "easy",
      source: "https://base.org"
    },
    {
        id: '3',
        question: "What is the native token of Ethereum?",
        answers: ["BTC", "ETH", "USDC", "BNB"],
        correctAnswer: 1,
        category: "Cryptocurrency",
        difficulty: "easy"
      },
      {
        id: '4',
        question: "What consensus mechanism does Ethereum use after The Merge?",
        answers: [
          "Proof of Work",
          "Proof of Stake",
          "Proof of Authority",
          "Delegated Proof of Stake"
        ],
        correctAnswer: 1,
        category: "Blockchain",
        difficulty: "medium",
        source: "https://ethereum.org/en/roadmap/merge/"
      },
      {
        id: '5',
        question: "What does 'NFT' stand for?",
        answers: [
          "New Financial Technology",
          "Network File Transfer",
          "Non-Fungible Token",
          "Native Format Type"
        ],
        correctAnswer: 2,
        category: "Web3",
        difficulty: "easy"
      }
  ];
  
  export async function getTriviaQuestions(count: number = 5): Promise<TriviaQuestion[]> {
    const shuffled = [...triviaQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }