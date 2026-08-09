/* 404 Page - Displays when a user attempts to access a non-existent route - translate to the language of the user */
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#F6F7F2] px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-6xl font-bold text-[#214D34]">404</h1>
        <p className="text-base sm:text-xl text-[#536057]">Oops! Page not found</p>
        <a
          href="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-[#2F6B45] text-white font-semibold text-sm hover:bg-[#214D34] transition-colors min-h-[44px] leading-[44px]"
        >
          Return to Home
        </a>
      </div>
    </div>
  )
}

export default NotFound
