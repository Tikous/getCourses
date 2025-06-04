// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CourseMarketplace is Ownable, ReentrancyGuard {
    IERC20 public skToken;
    
    struct Course {
        uint256 id;
        string title;
        string description;
        string imageUrl;
        uint256 price; // Price in SK tokens
        address instructor;
        bool isActive;
        uint256 studentsCount;
    }
    
    struct Purchase {
        uint256 courseId;
        address student;
        uint256 timestamp;
        uint256 pricePaid;
    }
    
    mapping(uint256 => Course) public courses;
    mapping(address => mapping(uint256 => bool)) public hasPurchased;
    mapping(address => uint256[]) public studentCourses;
    mapping(address => uint256[]) public instructorCourses;
    
    uint256 public nextCourseId = 1;
    uint256 public platformFeePercent = 5; // 5% platform fee
    
    Purchase[] public purchases;
    
    event CourseCreated(
        uint256 indexed courseId,
        string title,
        uint256 price,
        address indexed instructor
    );
    
    event CoursePurchased(
        uint256 indexed courseId,
        address indexed student,
        uint256 price,
        uint256 timestamp
    );
    
    event CourseUpdated(uint256 indexed courseId, string title, uint256 price);
    
    constructor(address _skTokenAddress) Ownable(msg.sender) {
        skToken = IERC20(_skTokenAddress);
    }
    
    /**
     * @dev Create a new course
     */
    function createCourse(
        string memory _title,
        string memory _description,
        string memory _imageUrl,
        uint256 _price
    ) external {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_price > 0, "Price must be greater than 0");
        
        courses[nextCourseId] = Course({
            id: nextCourseId,
            title: _title,
            description: _description,
            imageUrl: _imageUrl,
            price: _price,
            instructor: msg.sender,
            isActive: true,
            studentsCount: 0
        });
        
        instructorCourses[msg.sender].push(nextCourseId);
        
        emit CourseCreated(nextCourseId, _title, _price, msg.sender);
        nextCourseId++;
    }
    
    /**
     * @dev Purchase a course with SK tokens
     */
    function purchaseCourse(uint256 _courseId) external nonReentrant {
        Course storage course = courses[_courseId];
        require(course.isActive, "Course is not active");
        require(!hasPurchased[msg.sender][_courseId], "Already purchased this course");
        require(course.instructor != msg.sender, "Cannot purchase your own course");
        
        uint256 price = course.price;
        require(skToken.balanceOf(msg.sender) >= price, "Insufficient SK token balance");
        
        // Calculate platform fee
        uint256 platformFee = (price * platformFeePercent) / 100;
        uint256 instructorPayment = price - platformFee;
        
        // Transfer tokens
        require(skToken.transferFrom(msg.sender, address(this), platformFee), "Platform fee transfer failed");
        require(skToken.transferFrom(msg.sender, course.instructor, instructorPayment), "Instructor payment failed");
        
        // Update purchase records
        hasPurchased[msg.sender][_courseId] = true;
        studentCourses[msg.sender].push(_courseId);
        course.studentsCount++;
        
        // Record purchase
        purchases.push(Purchase({
            courseId: _courseId,
            student: msg.sender,
            timestamp: block.timestamp,
            pricePaid: price
        }));
        
        emit CoursePurchased(_courseId, msg.sender, price, block.timestamp);
    }
    
    /**
     * @dev Update course details (only by instructor)
     */
    function updateCourse(
        uint256 _courseId,
        string memory _title,
        string memory _description,
        string memory _imageUrl,
        uint256 _price
    ) external {
        Course storage course = courses[_courseId];
        require(course.instructor == msg.sender, "Only instructor can update course");
        require(course.isActive, "Course is not active");
        
        course.title = _title;
        course.description = _description;
        course.imageUrl = _imageUrl;
        course.price = _price;
        
        emit CourseUpdated(_courseId, _title, _price);
    }
    
    /**
     * @dev Deactivate a course (only by instructor)
     */
    function deactivateCourse(uint256 _courseId) external {
        Course storage course = courses[_courseId];
        require(course.instructor == msg.sender, "Only instructor can deactivate course");
        course.isActive = false;
    }
    
    /**
     * @dev Get all active courses
     */
    function getActiveCourses() external view returns (Course[] memory) {
        uint256 activeCount = 0;
        
        // Count active courses
        for (uint256 i = 1; i < nextCourseId; i++) {
            if (courses[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active courses
        Course[] memory activeCourses = new Course[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextCourseId; i++) {
            if (courses[i].isActive) {
                activeCourses[index] = courses[i];
                index++;
            }
        }
        
        return activeCourses;
    }
    
    /**
     * @dev Get courses purchased by a student
     */
    function getStudentCourses(address _student) external view returns (Course[] memory) {
        uint256[] memory courseIds = studentCourses[_student];
        Course[] memory purchasedCourses = new Course[](courseIds.length);
        
        for (uint256 i = 0; i < courseIds.length; i++) {
            purchasedCourses[i] = courses[courseIds[i]];
        }
        
        return purchasedCourses;
    }
    
    /**
     * @dev Get courses created by an instructor
     */
    function getInstructorCourses(address _instructor) external view returns (Course[] memory) {
        uint256[] memory courseIds = instructorCourses[_instructor];
        Course[] memory instructorCoursesArray = new Course[](courseIds.length);
        
        for (uint256 i = 0; i < courseIds.length; i++) {
            instructorCoursesArray[i] = courses[courseIds[i]];
        }
        
        return instructorCoursesArray;
    }
    
    /**
     * @dev Check if user has purchased a course
     */
    function hasUserPurchasedCourse(address _user, uint256 _courseId) external view returns (bool) {
        return hasPurchased[_user][_courseId];
    }
    
    /**
     * @dev Get total number of purchases
     */
    function getTotalPurchases() external view returns (uint256) {
        return purchases.length;
    }
    
    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = skToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(skToken.transfer(owner(), balance), "Transfer failed");
    }
    
    /**
     * @dev Update platform fee percentage (only owner)
     */
    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 10, "Fee cannot exceed 10%");
        platformFeePercent = _newFeePercent;
    }
} 