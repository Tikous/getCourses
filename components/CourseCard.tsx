import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACTS, SK_TOKEN_ABI, COURSE_MARKETPLACE_ABI } from '../lib/contracts'

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

interface CourseCardProps {
  course: Course
  onPurchased: () => void
}

export default function CourseCard({ course, onPurchased }: CourseCardProps) {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)

  // Check if user has purchased this course
  const { data: hasPurchased } = useReadContract({
    address: CONTRACTS.COURSE_MARKETPLACE,
    abi: COURSE_MARKETPLACE_ABI,
    functionName: 'hasUserPurchasedCourse',
    args: [address!, course.id],
    query: {
      enabled: !!address,
    },
  })

  // Check user's SK token balance
  const { data: skBalance } = useReadContract({
    address: CONTRACTS.SK_TOKEN,
    abi: SK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address,
    },
  })

  // Approve SK tokens
  const { writeContract: approveTokens, data: approveHash } = useWriteContract()
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  // Purchase course
  const { writeContract: purchaseCourse, data: purchaseHash } = useWriteContract()
  const { isLoading: isPurchasing, isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({
    hash: purchaseHash,
  })

  // Handle purchase success
  useEffect(() => {
    if (isPurchaseSuccess) {
      setIsLoading(false)
      onPurchased()
    }
  }, [isPurchaseSuccess, onPurchased])

  const handlePurchase = async () => {
    if (!address) return

    setIsLoading(true)
    try {
      // First approve tokens
      await approveTokens({
        address: CONTRACTS.SK_TOKEN,
        abi: SK_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACTS.COURSE_MARKETPLACE, course.price],
      })

      // Wait for approval, then purchase
      setTimeout(async () => {
        await purchaseCourse({
          address: CONTRACTS.COURSE_MARKETPLACE,
          abi: COURSE_MARKETPLACE_ABI,
          functionName: 'purchaseCourse',
          args: [course.id],
        })
      }, 2000)
    } catch (error) {
      console.error('Purchase failed:', error)
      setIsLoading(false)
    }
  }

  const canPurchase = address && 
    !hasPurchased && 
    course.instructor !== address && 
    skBalance && 
    skBalance >= course.price

  const isOwner = address === course.instructor

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden card-hover">
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
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {course.title}
          </h3>
          <div className="flex items-center text-sm text-gray-500 ml-2">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.studentsCount.toString()}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            讲师: {course.instructor.slice(0, 6)}...{course.instructor.slice(-4)}
          </div>
          <div className="text-lg font-bold text-primary-600">
            {formatEther(course.price)} SK
          </div>
        </div>

        {/* Purchase Status */}
        {hasPurchased && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">已购买</span>
            </div>
          </div>
        )}

        {isOwner && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-blue-800">我的课程</span>
            </div>
          </div>
        )}

        {/* Purchase Button */}
        {!hasPurchased && !isOwner && (
          <div>
            {!canPurchase && skBalance !== undefined && skBalance < course.price && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-yellow-800">
                    SK代币余额不足
                  </span>
                </div>
              </div>
            )}
            
            <button
              onClick={handlePurchase}
              disabled={!canPurchase || isLoading || isApproving || isPurchasing}
              className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                canPurchase && !isLoading && !isApproving && !isPurchasing
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading || isApproving || isPurchasing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isApproving ? '授权中...' : isPurchasing ? '购买中...' : '处理中...'}
                </div>
              ) : (
                '购买课程'
              )}
            </button>
          </div>
        )}

        {/* Balance Info */}
        {address && skBalance !== undefined && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            当前SK余额: {formatEther(skBalance)} SK
          </div>
        )}
      </div>
    </div>
  )
} 