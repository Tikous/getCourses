import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { CONTRACTS, COURSE_MARKETPLACE_ABI } from '../lib/contracts'

interface CreateCourseProps {
  onCourseCreated: () => void
}

export default function CreateCourse({ onCourseCreated }: CreateCourseProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  // Create course
  const { writeContract: createCourse, data: hash } = useWriteContract()
  const { isLoading: isPending, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      setIsLoading(false)
      setFormData({ title: '', description: '', imageUrl: '', price: '' })
      onCourseCreated()
    }
  }, [isSuccess, onCourseCreated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.price) return

    setIsLoading(true)
    try {
      await createCourse({
        address: CONTRACTS.COURSE_MARKETPLACE,
        abi: COURSE_MARKETPLACE_ABI,
        functionName: 'createCourse',
        args: [
          formData.title,
          formData.description,
          formData.imageUrl || 'https://via.placeholder.com/400x200?text=Course+Image',
          parseEther(formData.price)
        ],
      })
    } catch (error) {
      console.error('Course creation failed:', error)
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const canSubmit = formData.title && 
    formData.description && 
    formData.price && 
    !isNaN(Number(formData.price)) && 
    Number(formData.price) > 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            创建新课程
          </h3>
          <p className="text-sm text-gray-600">
            填写课程信息并设置价格（以SK代币计价）
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              课程标题 *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="输入课程标题"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Course Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              课程描述 *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="详细描述课程内容、学习目标等"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Course Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              课程封面图片URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/course-image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              留空将使用默认图片
            </p>
          </div>

          {/* Course Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              课程价格 (SK代币) *
            </label>
            <div className="relative">
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="100"
                step="1"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-gray-500 text-sm">SK</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              建议价格: 50-500 SK代币
            </p>
          </div>

          {/* Price Preview */}
          {formData.price && !isNaN(Number(formData.price)) && Number(formData.price) > 0 && (
            <div className="bg-primary-50 border border-primary-200 rounded-md p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">课程价格:</span>
                <span className="text-sm font-medium text-primary-900">
                  {formData.price} SK 代币
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-primary-600">平台手续费 (5%):</span>
                <span className="text-xs text-primary-800">
                  {(Number(formData.price) * 0.05).toFixed(2)} SK
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-primary-600">您将获得:</span>
                <span className="text-xs font-medium text-primary-800">
                  {(Number(formData.price) * 0.95).toFixed(2)} SK
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit || isLoading || isPending}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              canSubmit && !isLoading && !isPending
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading || isPending ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                创建中...
              </div>
            ) : (
              '创建课程'
            )}
          </button>
        </form>

        {/* Course Creation Tips */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">创建提示</h4>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• 课程标题要简洁明了，突出核心内容</div>
            <div>• 详细的课程描述有助于吸引更多学生</div>
            <div>• 合理定价，考虑课程价值和市场接受度</div>
            <div>• 平台收取5%手续费，用于维护和发展</div>
            <div>• 课程创建后即可在课程列表中查看</div>
          </div>
        </div>
      </div>
    </div>
  )
} 