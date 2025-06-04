const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 测试前端合约调用...");
  
  const skTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const marketplaceAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  try {
    // 使用前端相同的ABI
    const COURSE_MARKETPLACE_ABI = [
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
      }
    ];
    
    // 连接到合约
    const CourseMarketplace = new ethers.Contract(
      marketplaceAddress,
      COURSE_MARKETPLACE_ABI,
      ethers.provider
    );
    
    console.log("✅ 合约连接成功");
    
    // 调用getActiveCourses
    const courses = await CourseMarketplace.getActiveCourses();
    console.log(`📚 课程数量: ${courses.length}`);
    
    if (courses.length > 0) {
      console.log("\n📋 课程列表:");
      courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`);
        console.log(`   ID: ${course.id.toString()}`);
        console.log(`   价格: ${ethers.formatEther(course.price)} SK`);
        console.log(`   讲师: ${course.instructor}`);
        console.log(`   学生数: ${course.studentsCount.toString()}`);
        console.log(`   状态: ${course.isActive ? '活跃' : '非活跃'}`);
        console.log("");
      });
    }
    
  } catch (error) {
    console.log("❌ 测试失败:", error.message);
    console.log("完整错误:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 脚本失败:", error);
    process.exit(1);
  }); 