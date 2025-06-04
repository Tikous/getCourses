import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy SK Token
  console.log("\nDeploying SK Token...");
  const SKToken = await ethers.getContractFactory("SKToken");
  const skToken = await SKToken.deploy();
  await skToken.waitForDeployment();
  const skTokenAddress = await skToken.getAddress();
  console.log("SK Token deployed to:", skTokenAddress);

  // Deploy Course Marketplace
  console.log("\nDeploying Course Marketplace...");
  const CourseMarketplace = await ethers.getContractFactory("CourseMarketplace");
  const courseMarketplace = await CourseMarketplace.deploy(skTokenAddress);
  await courseMarketplace.waitForDeployment();
  const courseMarketplaceAddress = await courseMarketplace.getAddress();
  console.log("Course Marketplace deployed to:", courseMarketplaceAddress);

  // Create some sample courses for testing
  console.log("\nCreating sample courses...");
  
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

  console.log("\n=== Deployment Summary ===");
  console.log("SK Token Address:", skTokenAddress);
  console.log("Course Marketplace Address:", courseMarketplaceAddress);
  console.log("Deployer Address:", deployer.address);
  
  console.log("\n=== Contract Verification Commands ===");
  console.log(`npx hardhat verify --network sepolia ${skTokenAddress}`);
  console.log(`npx hardhat verify --network sepolia ${courseMarketplaceAddress} ${skTokenAddress}`);

  // Save deployment addresses to a file
  const fs = require('fs');
  const deploymentInfo = {
    network: "sepolia",
    skToken: skTokenAddress,
    courseMarketplace: courseMarketplaceAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 