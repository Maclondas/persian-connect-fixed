import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('🖼️ ImageWithFallback: Image failed to load:', props.src?.substring(0, 100) + '...')
    setDidError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    console.log('✅ ImageWithFallback: Image loaded successfully')
    setIsLoading(false)
  }

  const { src, alt, style, className, ...rest } = props

  // If no src provided, show error immediately
  if (!src) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt="No image source" {...rest} />
        </div>
      </div>
    )
  }

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${className ?? ''}`} style={style}>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        style={isLoading ? { ...style, opacity: 0 } : style} 
        {...rest} 
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}
