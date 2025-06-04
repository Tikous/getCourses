const hre = require("hardhat");

async function main() {
  console.log("🔍 测试合约状态...");
  
  const skTokenAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  const marketplaceAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
  
  try {
    // 连接到合约
    const SKToken = await hre.ethers.getContractAt("SKToken", skTokenAddress);
    const CourseMarketplace = await hre.ethers.getContractAt("CourseMarketplace", marketplaceAddress);
    
    console.log("✅ 合约连接成功");
    
    // 检查SK Token基本信息
    const tokenName = await SKToken.name();
    const tokenSymbol = await SKToken.symbol();
    console.log(`📝 SK Token: ${tokenName} (${tokenSymbol})`);
    
    // 检查课程数量
    try {
      const courses = await CourseMarketplace.getActiveCourses();
      console.log(`📚 活跃课程数量: ${courses.length}`);
      
      if (courses.length > 0) {
        console.log("\n📋 课程列表:");
        courses.forEach((course, index) => {
          console.log(`${index + 1}. ${course.title}`);
          console.log(`   价格: ${hre.ethers.formatEther(course.price)} SK`);
          console.log(`   讲师: ${course.instructor}`);
          console.log(`   学生数: ${course.studentsCount.toString()}`);
          console.log("");
        });
      }
    } catch (error) {
      console.log("❌ 获取课程失败:", error.message);
    }
    
    // 检查网络信息
    const network = await hre.ethers.provider.getNetwork();
    console.log(`🌐 网络: ${network.name} (Chain ID: ${network.chainId})`);
    
    // 检查最新区块
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log(`⛓️ 最新区块: ${blockNumber}`);
    
  } catch (error) {
    console.log("❌ 合约连接失败:", error.message);
    console.log("请确保 Hardhat 网络正在运行并且合约已部署");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  }); 