import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireWallet?: boolean
}

export const ProtectedRoute = ({ children, requireWallet = true }: ProtectedRouteProps) => {
  const { isConnected } = useAccount()
  const location = useLocation()

  useEffect(() => {
    document.body.classList.remove('animationGoBack')
  }, [location.pathname])

  if (requireWallet && !isConnected) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (isConnected && location.pathname === '/login') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
