import { MainLayout } from "../../layout/MainLayout"
import { useAuthStore } from "../../stores/authStore"
import { useState, useRef, useEffect } from "react"

// Get FRONTEND URL from environment variables
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL

export default function Homepage() {
  const { token, user, isAuthenticated } = useAuthStore()
  const [showWebsite, setShowWebsite] = useState(true) 
  const [error, setError] = useState(null)
  const [iframeHeight, setIframeHeight] = useState('100vh')
  const iframeRef = useRef(null)
  const containerRef = useRef(null)

  // Calculate dynamic iframe height based on viewport
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setIframeHeight(`${window.innerHeight - rect.top}px`)
      }
    }
    
    updateHeight()
    window.addEventListener('resize', updateHeight)
    window.addEventListener('orientationchange', updateHeight)
    
    return () => {
      window.removeEventListener('resize', updateHeight)
      window.removeEventListener('orientationchange', updateHeight)
    }
  }, [])

  useEffect(() => {
    if (showWebsite && iframeRef.current) {
      const iframe = iframeRef.current
      
      const handleLoad = () => {
        console.log('Iframe loaded successfully')
        setError(null)
      }
      
      const handleError = () => {
        console.error('Iframe failed to load')
        setError('Failed to load website. Check console for details.')
      }
      
      iframe.addEventListener('load', handleLoad)
      iframe.addEventListener('error', handleError)
      
      return () => {
        iframe.removeEventListener('load', handleLoad)
        iframe.removeEventListener('error', handleError)
      }
    }
  }, [showWebsite])

  if (!FRONTEND_URL) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 md:p-8 bg-red-50 border border-red-200 rounded-lg mx-4 sm:mx-6 md:mx-8 my-4">
          <h3 className="text-red-800 font-semibold text-sm sm:text-base">Configuration Error</h3>
          <p className="text-red-600 mt-1 text-xs sm:text-sm">
            VITE_FRONTEND_URL environment variable is not set. Please check your .env file.
          </p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Responsive container */}
      <div 
        ref={containerRef}
        className="w-full min-h-screen flex flex-col overflow-x-hidden"
      >
        {/* Responsive user info bar - adjusts position based on screen size */}
        {isAuthenticated && user && (
          <div className={`
            fixed z-50
            top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4
            lg:top-6 lg:right-6
          `}>
            <div className="
              bg-green-50/95 backdrop-blur-sm 
              text-green-700 
              px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2
              rounded-lg text-xs sm:text-sm font-medium 
              shadow-sm border border-green-200
              hover:bg-green-100 transition-colors
              max-w-[200px] sm:max-w-none
              truncate
            ">
              <span className="hidden xs:inline">Logged in as: </span>
              {user.name || user.email || user.username}
            </div>
          </div>
        )}
        
        {/* Website iframe container */}
        {showWebsite && (
          <div className="flex-1 flex flex-col w-full">
            <div className="bg-white flex flex-col flex-1 w-full overflow-hidden">
              
              {/* Responsive error fallback */}
              {error && (
                <div className="
                  bg-red-50 p-3 sm:p-4 
                  text-red-600 
                  shrink-0 z-50 
                  mx-2 sm:mx-4 md:mx-6 
                  mt-2 sm:mt-4 
                  rounded-lg shadow-sm
                ">
                  <p className="font-semibold text-sm sm:text-base">Error loading website:</p>
                  <p className="text-xs sm:text-sm mt-1 break-words">{error}</p>
                  <button
                    onClick={() => window.open(FRONTEND_URL, '_blank')}
                    className="
                      mt-2 px-3 py-1.5 sm:px-4 sm:py-2 
                      bg-red-600 text-white 
                      rounded-md text-xs sm:text-sm 
                      hover:bg-red-700 
                      transition-colors
                      focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                    "
                  >
                    Open in New Tab
                  </button>
                </div>
              )}

              {/* Responsive iframe container */}
              <div 
                className="flex-1 w-full relative"
                style={{ height: iframeHeight, minHeight: '300px' }}
              >
                <iframe
                  ref={iframeRef}
                  src={FRONTEND_URL}
                  title="Website Preview"
                  className="
                    absolute inset-0 
                    w-full 
                    border-0 
                    bg-white
                  "
                  style={{ height: '100%' }}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-top-navigation"
                  onError={() => setError('Iframe failed to load')}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add responsive styles for extra small screens */}
      <style jsx>{`
        @media (max-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
        }
        @media (min-width: 481px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </MainLayout>
  )
}