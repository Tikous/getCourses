const hre = require("hardhat");

async function main() {
  console.log("🚀 开始部署去中心化购课系统...");
  
  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  
  // 获取账户余额
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", hre.ethers.formatEther(balance), "ETH");
  
  console.log("\n📦 部署 SK Token 合约...");
  const SKToken = await hre.ethers.getContractFactory("SKToken");
  const skToken = await SKToken.deploy();
  await skToken.waitForDeployment();
  const skTokenAddress = await skToken.getAddress();
  console.log("✅ SK Token 部署成功:", skTokenAddress);
  
  console.log("\n📦 部署 Course Marketplace 合约...");
  const CourseMarketplace = await hre.ethers.getContractFactory("CourseMarketplace");
  const courseMarketplace = await CourseMarketplace.deploy(skTokenAddress);
  await courseMarketplace.waitForDeployment();
  const marketplaceAddress = await courseMarketplace.getAddress();
  console.log("✅ Course Marketplace 部署成功:", marketplaceAddress);
  
  console.log("\n🎯 创建示例课程...");
  
  // 创建几个示例课程
  const courses = [
    {
      title: "区块链开发入门",
      description: "学习Solidity智能合约开发，从零开始构建去中心化应用",
      imageUrl: "https://via.placeholder.com/400x200?text=Blockchain+Development",
      price: hre.ethers.parseEther("100")
    },
    {
      title: "DeFi协议设计",
      description: "深入理解去中心化金融协议的设计原理和实现方法",
      imageUrl: "https://via.placeholder.com/400x200?text=DeFi+Protocol",
      price: hre.ethers.parseEther("200")
    },
    {
      title: "NFT市场开发",
      description: "构建完整的NFT交易市场，包括铸造、交易和拍卖功能",
      imageUrl: "https://via.placeholder.com/400x200?text=NFT+Marketplace",
      price: hre.ethers.parseEther("150")
    }
  ];
  
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    await courseMarketplace.createCourse(
      course.title,
      course.description,
      course.imageUrl,
      course.price
    );
    console.log(`📚 课程 ${i + 1} 创建成功: ${course.title}`);
  }
  
  console.log("\n🎉 部署完成！");
  console.log("📋 合约地址汇总:");
  console.log("   SK Token:", skTokenAddress);
  console.log("   Course Marketplace:", marketplaceAddress);
  
  console.log("\n📖 使用说明:");
  console.log("1. 更新 lib/contracts.ts 中的合约地址");
  console.log("2. 配置环境变量 (.env.local)");
  console.log("3. 启动前端应用: npm run dev");
  console.log("4. 连接钱包并开始使用系统");
  
  console.log("\n🔗 系统功能:");
  console.log("• 使用 ETH 兑换 SK 代币 (1 ETH = 10,000 SK)");
  console.log("• 用 SK 代币购买课程");
  console.log("• 创建和发布自己的课程");
  console.log("• 平台收取 5% 手续费");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });