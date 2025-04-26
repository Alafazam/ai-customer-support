import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

interface JWTPayload {
  role: 'SUPPORT_AGENT' | 'CUSTOMER';
}

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/support-login']
  if (publicRoutes.includes(pathname)) {
    if (authToken) {
      try {
        const decoded = jwtDecode<JWTPayload>(authToken)
        
        // Handle redirects based on role and current page
        if (pathname === '/login') {
          // If on customer login page
          if (decoded.role === 'CUSTOMER') {
            return NextResponse.redirect(new URL('/chat', request.url))
          } else {
            // Support agent trying to access customer login
            return NextResponse.redirect(new URL('/support-login', request.url))
          }
        } else if (pathname === '/support-login') {
          // If on support login page
          if (decoded.role === 'SUPPORT_AGENT') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
          } else {
            // Customer trying to access support login
            return NextResponse.redirect(new URL('/login', request.url))
          }
        } else {
          // For homepage or other public routes
          const redirectUrl = decoded.role === 'CUSTOMER' ? '/chat' : '/dashboard'
          return NextResponse.redirect(new URL(redirectUrl, request.url))
        }
      } catch {
        // If token is invalid, clear it and continue to login
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('auth_token')
        return response
      }
    }
    return NextResponse.next()
  }

  // Protected routes that require authentication
  if (!authToken) {
    // Redirect to appropriate login page based on the route
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/support-login', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const decoded = jwtDecode<JWTPayload>(authToken)
    
    // Protect dashboard routes for support agents only
    if ((pathname.startsWith('/dashboard') || pathname.startsWith('/issues')) && decoded.role !== 'SUPPORT_AGENT') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Protect chat routes for customers only
    if (pathname.startsWith('/chat') && decoded.role !== 'CUSTOMER') {
      return NextResponse.redirect(new URL('/support-login', request.url))
    }

    return NextResponse.next()
  } catch {
    // If token is invalid, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_token')
    return response
  }
}

export const config = {
  matcher: [
    '/',
    '/chat/:path*',
    '/dashboard/:path*',
    '/issues/:path*',
    '/login',
    '/support-login'
  ]
} 