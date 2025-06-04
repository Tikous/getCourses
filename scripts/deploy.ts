const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {

  // Get the deployer account
  const [deployer] = await ethers.getSigners();

  // Deploy SK Token
  const SKToken = await ethers.getContractFactory("SKToken");
  const skToken = await SKToken.deploy();
  await skToken.waitForDeployment();
  const skTokenAddress = await skToken.getAddress();

  // Deploy Course Marketplace
  const CourseMarketplace = await ethers.getContractFactory("CourseMarketplace");
  const courseMarketplace = await CourseMarketplace.deploy(skTokenAddress);
  await courseMarketplace.waitForDeployment();
  const courseMarketplaceAddress = await courseMarketplace.getAddress();

  // Create some sample courses for testing
  const sampleCourses = [
    {
      title: "区块链开发入门",
      description: "学习区块链基础知识和智能合约开发",
      imageUrl: "https://via.placeholder.com/300x200?text=Blockchain+Course",
      price: ethers.parseEther("100") // 100 SK tokens
    },
    {
      title: "DeFi协议开发",
      description: "深入学习去中心化金融协议的设计与实现",
      imageUrl: "https://via.placeholder.com/300x200?text=DeFi+Course",
      price: ethers.parseEther("200") // 200 SK tokens
    },
    {
      title: "NFT市场开发",
      description: "构建完整的NFT交易市场平台",
      imageUrl: "https://via.placeholder.com/300x200?text=NFT+Course",
      price: ethers.parseEther("150") // 150 SK tokens
    }
  ];

  for (const course of sampleCourses) {
    const tx = await courseMarketplace.createCourse(
      course.title,
      course.description,
      course.imageUrl,
      course.price
    );
    await tx.wait();
    console.log(`Created course: ${course.title}`);
  }

  // Update lib/contracts.ts with new contract addresses
  console.log("\nUpdating contract addresses in lib/contracts.ts...");
  try {
    // 获取contracts.ts文件路径
    const contractsFilePath = path.resolve(__dirname, '../lib/contracts.ts');
    
    // 读取现有文件内容
    let contractsFileContent = fs.readFileSync(contractsFilePath, 'utf8');
    
    // 使用正则表达式替换合约地址
    contractsFileContent = contractsFileContent.replace(
      /SK_TOKEN: '0x[a-fA-F0-9]+'/,
      `SK_TOKEN: '${skTokenAddress}'`
    );
    
    contractsFileContent = contractsFileContent.replace(
      /COURSE_MARKETPLACE: '0x[a-fA-F0-9]+'/,
      `COURSE_MARKETPLACE: '${courseMarketplaceAddress}'`
    );
    
    // 写回文件
    fs.writeFileSync(contractsFilePath, contractsFileContent);
    console.log("Successfully updated contract addresses in lib/contracts.ts");
  } catch (error) {
    console.error("Failed to update lib/contracts.ts:", error);
  }

  // Save deployment addresses to a file
  const deploymentInfo = {
    network: "sepolia",
    skToken: skTokenAddress,
    courseMarketplace: courseMarketplaceAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 