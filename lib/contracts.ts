// Contract addresses - Update these after deployment
export const CONTRACTS = {
  SK_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
  COURSE_MARKETPLACE: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`,
}

// SK Token ABI
export const SK_TOKEN_ABI = [
  {
    "inputs": [],
    "name": "purchaseTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "ethAmount", "type": "uint256"}],
    "name": "calculateTokenAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Course Marketplace ABI
export const COURSE_MARKETPLACE_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_title", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "string", "name": "_imageUrl", "type": "string"},
      {"internalType": "uint256", "name": "_price", "type": "uint256"}
    ],
    "name": "createCourse",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_courseId", "type": "uint256"}],
    "name": "purchaseCourse",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveCourses",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "title", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "imageUrl", "type": "string"},
          {"internalType": "uint256", "name": "price", "type": "uint256"},
          {"internalType": "address", "name": "instructor", "type": "address"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "studentsCount", "type": "uint256"}
        ],
        "internalType": "struct CourseMarketplace.Course[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_student", "type": "address"}],
    "name": "getStudentCourses",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "title", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "imageUrl", "type": "string"},
          {"internalType": "uint256", "name": "price", "type": "uint256"},
          {"internalType": "address", "name": "instructor", "type": "address"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "studentsCount", "type": "uint256"}
        ],
        "internalType": "struct CourseMarketplace.Course[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_user", "type": "address"},
      {"internalType": "uint256", "name": "_courseId", "type": "uint256"}
    ],
    "name": "hasUserPurchasedCourse",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "courses",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string", "name": "imageUrl", "type": "string"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "address", "name": "instructor", "type": "address"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "uint256", "name": "studentsCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const 