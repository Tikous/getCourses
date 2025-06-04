import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACTS, COURSE_MARKETPLACE_ABI } from '../lib/contracts'

interface Course {
  id: bigint
  title: string
  description: string
  imageUrl: string
  price: bigint
  instructor: string
  isActive: boolean
  studentsCount: bigint
}

export default function MyCourses() {
  const { address } = useAccount()
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([])
  const [createdCourses, setCreatedCourses] = useState<Course[]>([])

  // Get all active courses
  const { data: allCourses, isLoading } = useReadContract({
    address: CONTRACTS.COURSE_MARKETPLACE,
    abi: COURSE_MARKETPLACE_ABI,
    functionName: 'getActiveCourses',
    query: {
      enabled: !!address,
    },
  })

  useEffect(() => {
    if (!allCourses || !address) return

    const checkPurchasedCourses = async () => {
      const purchased: Course[] = []
      const created: Course[] = []

      for (const course of allCourses as Course[]) {
        // Check if user is the instructor
        if (course.instructor.toLowerCase() === address.toLowerCase()) {
          created.push(course)
        } else {
          // Check if user has purchased this course
          try {
            // We'll need to call the contract to check purchase status
            // For now, we'll use a simpler approach
            // In a real implementation, you'd batch these calls
          } catch (error) {
            console.error('Error checking course purchase status:', error)
          }
        }
      }

      setCreatedCourses(created)
      // For now, we'll leave purchased courses empty until we implement proper checking
      setPurchasedCourses([])
    }

    checkPurchasedCourses()
  }, [allCourses, address])

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">加载我的课程中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Created Courses */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">我创建的课程</h2>
        {createdCourses.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无创建的课程</h3>
            <p className="mt-1 text-sm text-gray-500">开始创建您的第一个课程吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdCourses.map((course) => (
              <CourseCard key={course.id.toString()} course={course} isOwner={true} />
            ))}
          </div>
        )}
      </div>

      {/* Purchased Courses */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">我购买的课程</h2>
        {purchasedCourses.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无购买的课程</h3>
            <p className="mt-1 text-sm text-gray-500">去课程列表购买感兴趣的课程吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedCourses.map((course) => (
              <CourseCard key={course.id.toString()} course={course} isPurchased={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Simplified Course Card for My Courses page
function CourseCard({ course, isOwner = false, isPurchased = false }: {
  course: Course
  isOwner?: boolean
  isPurchased?: boolean
}) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Course+Image'
          }}
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {course.title}
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.studentsCount.toString()}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            {isOwner ? '我的课程' : `讲师: ${course.instructor.slice(0, 6)}...${course.instructor.slice(-4)}`}
          </div>
          <div className="text-lg font-bold text-primary-600">
            {formatEther(course.price)} SK
          </div>
        </div>

        {/* Status Badge */}
        {isOwner && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-blue-800">创建者</span>
              </div>
              <span className="text-xs text-blue-600">
                收入: {(Number(formatEther(course.price)) * Number(course.studentsCount) * 0.95).toFixed(2)} SK
              </span>
            </div>
          </div>
        )}

        {isPurchased && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">已购买</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 