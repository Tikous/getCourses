const hre = require("hardhat");

async function main() {
  console.log("🔍 验证合约部署...");
  
  const skTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const marketplaceAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  try {
    // 检查合约代码是否存在
    const skTokenCode = await hre.ethers.provider.getCode(skTokenAddress);
    const marketplaceCode = await hre.ethers.provider.getCode(marketplaceAddress);
    
    console.log("SK Token 合约代码长度:", skTokenCode.length);
    console.log("Marketplace 合约代码长度:", marketplaceCode.length);
    
    if (skTokenCode === "0x") {
      console.log("❌ SK Token 合约未部署");
      return;
    }
    
    if (marketplaceCode === "0x") {
      console.log("❌ Marketplace 合约未部署");
      return;
    }
    
    console.log("✅ 合约已正确部署");
    
    // 尝试调用合约函数
    const SKToken = await hre.ethers.getContractAt("SKToken", skTokenAddress);
    const CourseMarketplace = await hre.ethers.getContractAt("CourseMarketplace", marketplaceAddress);
    
    const tokenName = await SKToken.name();
    const tokenSymbol = await SKToken.symbol();
    console.log(`📝 Token: ${tokenName} (${tokenSymbol})`);
    
    const courses = await CourseMarketplace.getActiveCourses();
    console.log(`📚 课程数量: ${courses.length}`);
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} - ${hre.ethers.formatEther(course.price)} SK`);
    });
    
  } catch (error) {
    console.log("❌ 验证失败:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 脚本失败:", error);
    process.exit(1);
  }); 