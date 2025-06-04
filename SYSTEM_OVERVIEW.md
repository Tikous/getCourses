# 去中心化购课系统 - 完整实现

## 🎯 项目概述

这是一个基于以太坊区块链的去中心化课程购买平台，实现了完整的代币经济模型和课程交易功能。

## 🏗️ 系统架构

### 智能合约层
- **SKToken.sol**: ERC20代币合约，实现ETH到SK代币的兑换
- **CourseMarketplace.sol**: 课程市场合约，管理课程创建和购买

### 前端应用层
- **Next.js**: React框架，提供现代化的用户界面
- **RainbowKit**: 钱包连接和Web3交互
- **Tailwind CSS**: 响应式UI设计

## 💰 代币经济模型

### SK代币 (SK Token)
- **标准**: ERC20
- **兑换比例**: 1 ETH = 10,000 SK代币
- **用途**: 购买平台课程的唯一支付方式

### 平台费用
- **手续费**: 每笔课程购买收取5%平台费
- **分配**: 95%给课程创建者，5%给平台

## 🔧 核心功能

### 1. 代币兑换
```solidity
function purchaseTokens() external payable {
    require(msg.value > 0, "ETH amount must be greater than 0");
    uint256 tokenAmount = msg.value * EXCHANGE_RATE;
    _mint(msg.sender, tokenAmount);
    emit TokensPurchased(msg.sender, msg.value, tokenAmount);
}
```

### 2. 课程创建
```solidity
function createCourse(
    string memory _title,
    string memory _description,
    string memory _imageUrl,
    uint256 _price
) external {
    courseCounter++;
    courses[courseCounter] = Course({
        id: courseCounter,
        title: _title,
        description: _description,
        imageUrl: _imageUrl,
        price: _price,
        instructor: msg.sender,
        studentsCount: 0,
        isActive: true
    });
    emit CourseCreated(courseCounter, _title, msg.sender, _price);
}
```

### 3. 课程购买
```solidity
function purchaseCourse(uint256 _courseId) external nonReentrant {
    Course storage course = courses[_courseId];
    require(course.isActive, "Course is not active");
    require(course.instructor != msg.sender, "Cannot purchase your own course");
    require(!userPurchases[msg.sender][_courseId], "Already purchased this course");
    
    uint256 platformFee = (course.price * PLATFORM_FEE_PERCENTAGE) / 100;
    uint256 instructorPayment = course.price - platformFee;
    
    skToken.transferFrom(msg.sender, course.instructor, instructorPayment);
    skToken.transferFrom(msg.sender, address(this), platformFee);
    
    userPurchases[msg.sender][_courseId] = true;
    course.studentsCount++;
    
    emit CoursePurchased(_courseId, msg.sender, course.price);
}
```

## 🎨 用户界面

### 主要组件

1. **TokenPurchase.tsx**: ETH到SK代币兑换界面
   - 显示当前余额
   - 实时计算兑换数量
   - 交易状态跟踪

2. **CourseCard.tsx**: 课程展示和购买界面
   - 课程信息展示
   - 购买按钮和状态
   - 余额验证

3. **CreateCourse.tsx**: 课程创建界面
   - 表单验证
   - 价格预览
   - 手续费计算

## 📱 前端特性

### 钱包集成
```typescript
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';

const { chains, publicClient } = configureChains(
  [sepolia],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID })]
);
```

### 智能合约交互
```typescript
const { writeContract: purchaseTokens } = useWriteContract();

const handlePurchase = async () => {
  await purchaseTokens({
    address: CONTRACTS.SK_TOKEN,
    abi: SK_TOKEN_ABI,
    functionName: 'purchaseTokens',
    value: parseEther(ethAmount),
  });
};
```

## 🔒 安全特性

### 智能合约安全
- **ReentrancyGuard**: 防止重入攻击
- **Ownable**: 权限控制
- **输入验证**: 所有用户输入都经过验证
- **事件日志**: 完整的操作记录

### 前端安全
- **类型安全**: TypeScript确保类型安全
- **输入验证**: 前端表单验证
- **错误处理**: 完善的错误处理机制

## 🚀 部署指南

### 1. 环境配置
```bash
# 复制环境变量模板
cp env.example .env.local

# 填写必要的配置
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 2. 合约部署
```bash
# 编译合约
npm run compile

# 部署到Sepolia测试网
npm run deploy

# 或使用演示脚本
npx hardhat run deploy-demo.js --network sepolia
```

### 3. 前端启动
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📊 测试覆盖

### 智能合约测试
- SK代币基本功能测试
- ETH兑换功能测试
- 课程创建和购买测试
- 权限控制测试
- 边界条件测试

### 前端测试
- 组件渲染测试
- 用户交互测试
- 钱包连接测试
- 错误处理测试

## 🌟 系统优势

### 去中心化
- 无需中心化服务器
- 数据存储在区块链上
- 用户完全控制资产

### 透明性
- 所有交易公开可查
- 智能合约代码开源
- 平台费用透明

### 安全性
- 智能合约安全审计
- 多重安全防护
- 用户资产安全保障

### 可扩展性
- 模块化设计
- 易于添加新功能
- 支持多种代币标准

## 🔮 未来规划

### 功能扩展
- [ ] 课程评价系统
- [ ] 学习进度跟踪
- [ ] 证书NFT发放
- [ ] 多语言支持

### 技术优化
- [ ] Layer 2 集成
- [ ] 跨链支持
- [ ] 移动端应用
- [ ] 离线功能

### 生态建设
- [ ] 讲师激励机制
- [ ] 学习者奖励系统
- [ ] 社区治理功能
- [ ] 合作伙伴集成

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues
- 邮箱: support@example.com
- 社区论坛: https://forum.example.com

---

**注意**: 这是一个演示项目，在生产环境使用前请进行完整的安全审计。 