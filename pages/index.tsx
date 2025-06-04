import { useState, useEffect } from 'react'
import Head from 'next/head'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import CourseCard from '../components/CourseCard'
import TokenPurchase from '../components/TokenPurchase'
import CreateCourse from '../components/CreateCourse'
import NetworkStatus from '../components/NetworkStatus'
import MyCourses from '../components/MyCourses'
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

export default function Home() {
  const { address, isConnected } = useAccount()
  const [courses, setCourses] = useState<Course[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [activeTab, setActiveTab] = useState<'courses' | 'purchase' | 'create' | 'my-courses'>('courses')

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address: address,
  })

  // Get SK token balance
  const { data: skBalance, refetch: refetchSkBalance } = useReadContract({
    address: CONTRACTS.SK_TOKEN,
    abi: SK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address,
    },
  })

  // Read active courses
  const { data: coursesData, refetch: refetchCourses, error: coursesError, isLoading: coursesLoading } = useReadContract({
    address: CONTRACTS.COURSE_MARKETPLACE,
    abi: COURSE_MARKETPLACE_ABI,
    functionName: 'getActiveCourses',
    query: {
      enabled: !!address && isConnected,
    },
  })

  useEffect(() => {
    console.log('Courses data:', coursesData)
    console.log('Courses error:', coursesError)
    console.log('Courses loading:', coursesLoading)
    console.log('Contract address:', CONTRACTS.COURSE_MARKETPLACE)
    
    if (coursesData && address) {
      const allCourses = coursesData as Course[]
      setCourses(allCourses)
      
      // Filter courses to show only purchasable ones (not owned by user and not purchased)
      const purchasable = allCourses.filter(course => 
        course.instructor.toLowerCase() !== address.toLowerCase()
      )
      setAvailableCourses(purchasable)
    }
  }, [coursesData, coursesError, coursesLoading, address])

  const handleCourseCreated = () => {
    refetchCourses()
    setActiveTab('courses')
  }

  const handleCoursePurchased = () => {
    refetchCourses()
  }

  const handleBalanceUpdate = () => {
    refetchSkBalance()
  }

  return (
    <>
      <Head>
        <title>去中心化购课系统</title>
        <meta name="description" content="基于区块链的去中心化课程购买平台" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  🎓 去中心化购课系统
                </h1>
              </div>
              <ConnectButton />
            </div>
          </div>
        </header>

        {/* Navigation */}
        {isConnected && (
          <nav className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'courses'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  课程列表
                </button>
                <button
                  onClick={() => setActiveTab('purchase')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'purchase'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  购买代币
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'create'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  创建课程
                </button>
                <button
                  onClick={() => setActiveTab('my-courses')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'my-courses'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  我的课程
                </button>
              </div>
            </div>
          </nav>
        )}

        {/* Balance Display */}
        {isConnected && (
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">💰</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">ETH 余额</p>
                      <p className="text-lg font-bold text-primary-600">
                        {ethBalance ? Number(formatEther(ethBalance.value)).toFixed(4) : '0.0000'} ETH
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">🪙</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">SK 代币</p>
                      <p className="text-lg font-bold text-green-600">
                        {skBalance ? Number(formatEther(skBalance)).toLocaleString() : '0'} SK
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">汇率: 1 ETH = 10,000 SK</p>
                  <p className="text-xs text-gray-500">
                    约等于 {skBalance ? (Number(formatEther(skBalance)) / 10000).toFixed(4) : '0.0000'} ETH
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {!isConnected ? (
            <div className="text-center py-12">
              <div className="gradient-bg rounded-lg p-8 mx-4">
                <h2 className="text-3xl font-bold text-white mb-4">
                  欢迎来到去中心化购课系统
                </h2>
                <p className="text-xl text-white mb-8">
                  使用区块链技术，安全透明地购买和销售在线课程
                </p>
                <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    系统功能
                  </h3>
                  <ul className="text-left text-gray-600 space-y-2">
                    <li>• 使用ETH兑换SK代币 (1 ETH = 10,000 SK)</li>
                    <li>• 用SK代币购买课程</li>
                    <li>• 创建和发布自己的课程</li>
                    <li>• 查看链上课程列表</li>
                    <li>• 去中心化的交易记录</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 sm:px-0">
              {/* Network Status - Show on all tabs */}
              <NetworkStatus />
              
              {activeTab === 'courses' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">课程列表</h2>
                    <p className="text-gray-600">浏览并购买感兴趣的课程</p>
                  </div>
                  
                  {coursesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-4 text-gray-500">加载课程中...</p>
                    </div>
                  ) : coursesError ? (
                    <div className="text-center py-12">
                      <div className="text-red-500">
                        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">加载失败</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          请确保钱包已连接到正确的网络 (Hardhat Local)
                        </p>
                        <button 
                          onClick={() => refetchCourses()}
                          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                        >
                          重试
                        </button>
                      </div>
                    </div>
                  ) : availableCourses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">暂无可购买的课程</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {courses.length > 0 ? '所有课程都是您创建的，去"我的课程"查看' : '开始创建第一个课程吧！'}
                        </p>
                        <button 
                          onClick={() => setActiveTab(courses.length > 0 ? 'my-courses' : 'create')}
                          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                        >
                          {courses.length > 0 ? '查看我的课程' : '创建课程'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 text-sm text-gray-600">
                        找到 {availableCourses.length} 个可购买的课程
                        {courses.length > availableCourses.length && (
                          <span className="ml-2 text-primary-600">
                            (您创建了 {courses.length - availableCourses.length} 个课程)
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableCourses.map((course) => (
                          <CourseCard
                            key={course.id.toString()}
                            course={course}
                            onPurchased={handleCoursePurchased}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'purchase' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">购买SK代币</h2>
                    <p className="text-gray-600">使用ETH兑换SK代币来购买课程</p>
                  </div>
                  <TokenPurchase onBalanceUpdate={handleBalanceUpdate} />
                </div>
              )}

              {activeTab === 'create' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">创建课程</h2>
                    <p className="text-gray-600">发布你的课程并开始赚取收益</p>
                  </div>
                  <CreateCourse onCourseCreated={handleCourseCreated} />
                </div>
              )}

              {activeTab === 'my-courses' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">我的课程</h2>
                    <p className="text-gray-600">查看和管理你的课程</p>
                  </div>
                  <MyCourses />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  )
} 