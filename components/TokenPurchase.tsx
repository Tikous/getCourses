import { useState, useEffect } from 'react'
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { CONTRACTS, SK_TOKEN_ABI } from '../lib/contracts'

interface TokenPurchaseProps {
  onBalanceUpdate?: () => void
}

export default function TokenPurchase({ onBalanceUpdate }: TokenPurchaseProps) {
  const { address } = useAccount()
  const [tokenAmount, setTokenAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

  // Calculate ETH amount needed
  const ethNeeded = tokenAmount && !isNaN(Number(tokenAmount)) && Number(tokenAmount) > 0 
    ? (Number(tokenAmount) / 10000).toString() 
    : '0'

  // Purchase tokens
  const { writeContract: purchaseTokens, data: hash } = useWriteContract()
  const { isLoading: isPending, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      setIsLoading(false)
      setTokenAmount('')
      refetchSkBalance()
      // 通知父组件更新余额
      if (onBalanceUpdate) {
        onBalanceUpdate()
      }
    }
  }, [isSuccess, refetchSkBalance, onBalanceUpdate])

  const handlePurchase = async () => {
    if (!tokenAmount || !address || Number(tokenAmount) <= 0) return

    const ethValue = parseEther(ethNeeded)
    setIsLoading(true)
    try {
      await purchaseTokens({
        address: CONTRACTS.SK_TOKEN,
        abi: SK_TOKEN_ABI,
        functionName: 'purchaseTokens',
        value: ethValue,
      })
    } catch (error) {
      console.error('Purchase failed:', error)
      setIsLoading(false)
    }
  }

  const canPurchase = tokenAmount && 
    !isNaN(Number(tokenAmount)) && 
    Number(tokenAmount) > 0 && 
    ethBalance && 
    parseEther(ethNeeded) <= ethBalance.value

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            购买SK代币
          </h3>
          <p className="text-sm text-gray-600">
            汇率: 1 ETH = 10,000 SK 代币
          </p>
        </div>

        {/* Current Balances */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">当前余额</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">ETH:</span>
              <span className="text-sm font-medium">
                {ethBalance ? Number(formatEther(ethBalance.value)).toFixed(4) : '0'} ETH
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">SK代币:</span>
              <span className="text-sm font-medium text-green-600">
                {skBalance ? Number(formatEther(skBalance)).toLocaleString() : '0'} SK
              </span>
            </div>
          </div>
        </div>

        {/* Purchase Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="tokenAmount" className="block text-sm font-medium text-gray-700 mb-2">
              SK代币数量
            </label>
            <div className="relative">
              <input
                type="number"
                id="tokenAmount"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="1000"
                step="100"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-gray-500 text-sm">SK</span>
              </div>
            </div>
          </div>

          {/* ETH Cost Preview */}
          {tokenAmount && Number(tokenAmount) > 0 && (
            <div className="bg-primary-50 border border-primary-200 rounded-md p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">需要支付:</span>
                <span className="text-sm font-medium text-primary-900">
                  {ethNeeded} ETH
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-primary-600">将获得:</span>
                <span className="text-xs font-medium text-primary-800">
                  {Number(tokenAmount).toLocaleString()} SK 代币
                </span>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {tokenAmount && ethBalance && parseEther(ethNeeded) > ethBalance.value && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-red-800">
                  ETH余额不足，需要 {ethNeeded} ETH
                </span>
              </div>
            </div>
          )}

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={!canPurchase || isLoading || isPending}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              canPurchase && !isLoading && !isPending
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
                购买中...
              </div>
            ) : (
              '购买SK代币'
            )}
          </button>
        </div>

        {/* Quick Amount Buttons */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">快速选择:</p>
          <div className="grid grid-cols-3 gap-2">
            {['1000', '5000', '10000'].map((amount) => (
              <button
                key={amount}
                onClick={() => setTokenAmount(amount)}
                className="py-2 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {Number(amount).toLocaleString()} SK
              </button>
            ))}
          </div>
        </div>

        {/* Exchange Rate Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div>• 汇率: 1 ETH = 10,000 SK 代币</div>
            <div>• 购买的代币将立即到账</div>
            <div>• 可用于购买平台上的所有课程</div>
            <div>• 余额会在交易确认后自动更新</div>
          </div>
        </div>
      </div>
    </div>
  )
} 