import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Course Purchase System", function () {
  let skToken: any;
  let courseMarketplace: any;
  let owner: HardhatEthersSigner;
  let instructor: HardhatEthersSigner;
  let student: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, instructor, student] = await ethers.getSigners();

    // Deploy SK Token
    const SKTokenFactory = await ethers.getContractFactory("SKToken");
    skToken = await SKTokenFactory.deploy();
    await skToken.waitForDeployment();

    // Deploy Course Marketplace
    const CourseMarketplaceFactory = await ethers.getContractFactory("CourseMarketplace");
    courseMarketplace = await CourseMarketplaceFactory.deploy(await skToken.getAddress());
    await courseMarketplace.waitForDeployment();
  });

  describe("SK Token", function () {
    it("Should have correct name and symbol", async function () {
      expect(await skToken.name()).to.equal("SK Token");
      expect(await skToken.symbol()).to.equal("SK");
    });

    it("Should allow purchasing tokens with ETH", async function () {
      const ethAmount = ethers.parseEther("1");
      const expectedTokens = ethAmount * BigInt(10000);

      await skToken.connect(student).purchaseTokens({ value: ethAmount });
      
      expect(await skToken.balanceOf(student.address)).to.equal(expectedTokens);
    });

    it("Should calculate token amount correctly", async function () {
      const ethAmount = ethers.parseEther("0.5");
      const expectedTokens = ethAmount * BigInt(10000);
      
      expect(await skToken.calculateTokenAmount(ethAmount)).to.equal(expectedTokens);
    });

    it("Should allow owner to withdraw ETH", async function () {
      const ethAmount = ethers.parseEther("1");
      await skToken.connect(student).purchaseTokens({ value: ethAmount });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      await skToken.connect(owner).withdrawETH();
      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("Course Marketplace", function () {
    beforeEach(async function () {
      // Student purchases some SK tokens
      const ethAmount = ethers.parseEther("1");
      await skToken.connect(student).purchaseTokens({ value: ethAmount });
    });

    it("Should allow creating a course", async function () {
      const title = "Test Course";
      const description = "Test Description";
      const imageUrl = "https://test.com/image.jpg";
      const price = ethers.parseEther("100");

      await courseMarketplace.connect(instructor).createCourse(title, description, imageUrl, price);
      
      const course = await courseMarketplace.courses(1);
      expect(course.title).to.equal(title);
      expect(course.description).to.equal(description);
      expect(course.price).to.equal(price);
      expect(course.instructor).to.equal(instructor.address);
      expect(course.isActive).to.be.true;
    });

    it("Should allow purchasing a course", async function () {
      // Create a course
      const price = ethers.parseEther("100");
      await courseMarketplace.connect(instructor).createCourse(
        "Test Course",
        "Test Description", 
        "https://test.com/image.jpg",
        price
      );

      // Approve tokens for marketplace
      await skToken.connect(student).approve(await courseMarketplace.getAddress(), price);
      
      // Purchase course
      await courseMarketplace.connect(student).purchaseCourse(1);
      
      // Check purchase
      expect(await courseMarketplace.hasUserPurchasedCourse(student.address, 1)).to.be.true;
      
      // Check course student count
      const course = await courseMarketplace.courses(1);
      expect(course.studentsCount).to.equal(1);
    });

    it("Should prevent purchasing the same course twice", async function () {
      const price = ethers.parseEther("100");
      await courseMarketplace.connect(instructor).createCourse(
        "Test Course",
        "Test Description",
        "https://test.com/image.jpg", 
        price
      );

      await skToken.connect(student).approve(await courseMarketplace.getAddress(), price * BigInt(2));
      await courseMarketplace.connect(student).purchaseCourse(1);
      
      await expect(
        courseMarketplace.connect(student).purchaseCourse(1)
      ).to.be.revertedWith("Already purchased this course");
    });

    it("Should prevent instructor from purchasing their own course", async function () {
      const price = ethers.parseEther("100");
      await courseMarketplace.connect(instructor).createCourse(
        "Test Course",
        "Test Description",
        "https://test.com/image.jpg",
        price
      );

      // Instructor gets some tokens
      await skToken.connect(instructor).purchaseTokens({ value: ethers.parseEther("1") });
      await skToken.connect(instructor).approve(await courseMarketplace.getAddress(), price);
      
      await expect(
        courseMarketplace.connect(instructor).purchaseCourse(1)
      ).to.be.revertedWith("Cannot purchase your own course");
    });

    it("Should return active courses", async function () {
      await courseMarketplace.connect(instructor).createCourse(
        "Course 1",
        "Description 1",
        "https://test.com/1.jpg",
        ethers.parseEther("100")
      );
      
      await courseMarketplace.connect(instructor).createCourse(
        "Course 2", 
        "Description 2",
        "https://test.com/2.jpg",
        ethers.parseEther("200")
      );

      const activeCourses = await courseMarketplace.getActiveCourses();
      expect(activeCourses.length).to.equal(2);
      expect(activeCourses[0].title).to.equal("Course 1");
      expect(activeCourses[1].title).to.equal("Course 2");
    });

    it("Should handle platform fees correctly", async function () {
      const price = ethers.parseEther("100");
      const platformFee = price * BigInt(5) / BigInt(100); // 5%
      const instructorPayment = price - platformFee;

      await courseMarketplace.connect(instructor).createCourse(
        "Test Course",
        "Test Description",
        "https://test.com/image.jpg",
        price
      );

      const initialInstructorBalance = await skToken.balanceOf(instructor.address);
      const initialMarketplaceBalance = await skToken.balanceOf(await courseMarketplace.getAddress());

      await skToken.connect(student).approve(await courseMarketplace.getAddress(), price);
      await courseMarketplace.connect(student).purchaseCourse(1);

      const finalInstructorBalance = await skToken.balanceOf(instructor.address);
      const finalMarketplaceBalance = await skToken.balanceOf(await courseMarketplace.getAddress());

      expect(finalInstructorBalance - initialInstructorBalance).to.equal(instructorPayment);
      expect(finalMarketplaceBalance - initialMarketplaceBalance).to.equal(platformFee);
    });
  });
}); 