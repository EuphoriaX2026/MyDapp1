import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Loader } from './Loader'

interface AuthRedirectProps {
  children: ReactNode
}

export const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const { isConnected, isConnecting } = useAccount()
  const location = useLocation()

  // Show loader while checking connection status
  if (isConnecting) {
    return <Loader />
  }

  // If not connected and trying to access protected routes, redirect to login
  if (!isConnected && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  // If connected and on login page, redirect to dashboard
  if (isConnected && location.pathname === '/login') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
