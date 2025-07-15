import * as React from "react"

export const Loading: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

export const LoadingText: React.FC<{ text?: string; className?: string }> = ({ 
  text = "加载中...", 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <span className="text-gray-600">{text}</span>
    </div>
  )
} 