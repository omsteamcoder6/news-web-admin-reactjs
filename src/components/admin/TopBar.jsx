// frontend/src/components/layout/TopBar.js
import { Bell, Settings, User, Shield } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL

export function TopBar() {
  const { token, user: storeUser, isAuthenticated, logout, setAuth } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const notificationRef = useRef(null)

  useEffect(() => {
    // If we already have user in store, use it
    if (storeUser) {
      setUserRole(storeUser.role)
      setLoading(false)
      return
    }
    
    // Otherwise fetch from API
    fetchUserProfile()
  }, [storeUser])

  // Fetch notifications when user is admin and authenticated
  useEffect(() => {
    if (isAuthenticated && userRole === 'admin' && token) {
      fetchPendingInquiries()
      
      // Set up polling every 30 seconds for new inquiries
      const interval = setInterval(() => {
        fetchPendingInquiries(true) // silent refresh
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, userRole, token])

  // Handle click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUserProfile = async () => {
    try {
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Update store with user data
        setAuth(token, data.data.user)
        setUserRole(data.data.user.role)
      } else if (response.status === 401) {
        // Token invalid, logout
        logout()
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingInquiries = async (silent = false) => {
    if (!token || userRole !== 'admin') return
    
    if (!silent) {
      setIsLoadingNotifications(true)
    }
    
    try {
      // Fetch only pending inquiries for notifications
      const response = await fetch(`${API_BASE_URL}/advertising-inquiry?status=pending&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Store all pending inquiries as notifications
        const pendingInquiries = data.data || []
        
        // Check against stored notifications to see which are new
        const storedNotifications = JSON.parse(localStorage.getItem('seen_notifications') || '{}')
        const lastCheckTime = localStorage.getItem('last_notification_check')
        const now = new Date().getTime()
        
        // Mark notifications as new if they were created after last check
        const notificationsWithStatus = pendingInquiries.map(inquiry => {
          const inquiryCreatedAt = new Date(inquiry.createdAt).getTime()
          const isNew = !storedNotifications[inquiry._id] || 
                        (lastCheckTime && inquiryCreatedAt > parseInt(lastCheckTime))
          
          return {
            id: inquiry._id,
            title: 'New Advertising Inquiry',
            message: `${inquiry.fullName} from ${inquiry.companyName} submitted an inquiry`,
            time: inquiry.createdAt,
            read: !isNew,
            inquiryId: inquiry._id,
            fullName: inquiry.fullName,
            companyName: inquiry.companyName,
            email: inquiry.email,
            phone: inquiry.phone,
            status: inquiry.status
          }
        })
        
        setNotifications(notificationsWithStatus)
        setUnreadCount(notificationsWithStatus.filter(n => !n.read).length)
        
        // Update last check time
        localStorage.setItem('last_notification_check', now.toString())
      }
    } catch (error) {
      console.error('Failed to fetch pending inquiries:', error)
    } finally {
      if (!silent) {
        setIsLoadingNotifications(false)
      }
    }
  }

  const markAsRead = async (notificationId, inquiryId) => {
    // Update local storage
    const storedNotifications = JSON.parse(localStorage.getItem('seen_notifications') || '{}')
    storedNotifications[inquiryId] = true
    localStorage.setItem('seen_notifications', JSON.stringify(storedNotifications))
    
    // Update local state
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    const storedNotifications = JSON.parse(localStorage.getItem('seen_notifications') || '{}')
    notifications.forEach(notif => {
      storedNotifications[notif.inquiryId] = true
    })
    localStorage.setItem('seen_notifications', JSON.stringify(storedNotifications))
    
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    setUnreadCount(0)
  }

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id, notification.inquiryId)
    setShowNotifications(false)
    // Navigate to inquiries page with the specific inquiry
    window.location.href = `/admin/inquiries/${notification.inquiryId}`
  }

  const getUserInitials = () => {
    if (!storeUser?.name) return 'A'
    return storeUser.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeColor = () => {
    switch(userRole) {
      case 'admin':
        return 'text-orange-600 font-semibold'
      case 'editor':
        return 'text-blue-600'
      case 'author':
        return 'text-green-600'
      case 'viewer':
        return 'text-purple-600'
      default:
        return 'text-slate-500'
    }
  }

  const getRoleDisplay = () => {
    switch(userRole) {
      case 'admin':
        return 'Administrator'
      case 'editor':
        return 'Editor'
      case 'author':
        return 'Author'
      case 'viewer':
        return 'Viewer'
      default:
        return 'User'
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  // Handle logout with API call
  const handleLogout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout()
      window.location.href = '/login'
    }
  }

  // Only show admin features
  const isAdmin = userRole === 'admin'

  // Show access denied for non-admin
  if (!loading && !isAdmin && isAuthenticated) {
    return (
      <div className="bg-red-50 border-b border-red-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm text-red-800">
              Access Restricted: Admin Area Only
            </h2>
            <p className="text-xs text-red-600 mt-1">
              You don't have permission to view this dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Logout
            </button>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-4 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    )
  }

  // Full Admin TopBar
  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm text-slate-500">
            Welcome back, {storeUser?.name?.split(' ')[0] || 'Admin'}!
          </h2>
        </div>
        <p className="text-xs text-orange-600 font-medium mt-1">
          Admin Dashboard • Full System Access
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* Admin Notifications with Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button 
            className="relative text-slate-600 hover:text-slate-900 transition"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
                <div>
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Advertising inquiries
                  </p>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-xs text-slate-500 mt-2">Loading...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No new notifications</p>
                    <p className="text-xs text-slate-400 mt-1">
                      All inquiries have been reviewed
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 hover:bg-slate-50 cursor-pointer transition ${
                          !notification.read ? 'bg-orange-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            !notification.read ? 'bg-orange-500' : 'bg-transparent'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-slate-900">
                                {notification.title}
                              </p>
                              <span className="text-xs text-slate-400">
                                {formatTime(notification.time)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-500">
                                📧 {notification.email}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">
                                📞 {notification.phone}
                              </span>
                            </div>
                            {!notification.read && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                  New
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t border-slate-200 bg-slate-50">
                <a
                  href="/admin/inquiries"
                  className="block text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowNotifications(false)
                    window.location.href = '/admin/inquiries'
                  }}
                >
                  View all inquiries →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Admin Settings */}
        <button className="text-slate-600 hover:text-slate-900 transition">
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer">
            <div className="text-right">
              {storeUser ? (
                <>
                  <p className="text-sm font-medium text-slate-900">{storeUser.name}</p>
                  <p className={`text-xs ${getRoleBadgeColor()}`}>
                    {getRoleDisplay()}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-900">Loading...</p>
                  <p className="text-xs text-slate-500">Admin</p>
                </>
              )}
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-sm">
              {storeUser?.name ? (
                <span className="text-xs font-medium text-white">
                  {getUserInitials()}
                </span>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-1">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-500">Signed in as</p>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {storeUser?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}