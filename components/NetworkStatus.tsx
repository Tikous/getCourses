import { useAccount, useChainId, useBlockNumber } from 'wagmi'
import { CONTRACTS } from '../lib/contracts'

export default function NetworkStatus() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { data: blockNumber } = useBlockNumber()

  if (!isConnected) return null

  const isCorrectNetwork = chainId === 31337 // Hardhat local network
  
  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-900 mb-2">网络状态</h3>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">链ID:</span>
          <span className={`font-medium ${isCorrectNetwork ? 'text-green-600' : 'text-red-600'}`}>
            {chainId} {isCorrectNetwork ? '✅' : '❌'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">最新区块:</span>
          <span className="font-medium text-gray-900">
            {blockNumber ? blockNumber.toString() : '加载中...'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">SK Token:</span>
          <span className="font-mono text-xs text-gray-500">
            {CONTRACTS.SK_TOKEN.slice(0, 8)}...
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Marketplace:</span>
          <span className="font-mono text-xs text-gray-500">
            {CONTRACTS.COURSE_MARKETPLACE.slice(0, 8)}...
          </span>
        </div>
      </div>
      
      {!isCorrectNetwork && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          ⚠️ 请切换到 Hardhat Local 网络 (Chain ID: 31337)
        </div>
      )}
    </div>
  )
} 