'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  level: number
  xp: number
  streak: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  purchaseCourse: (courseId: string) => void
  purchaseSeries: (seriesId: string) => void
  purchasePathway: (pathwayId: string) => void
  purchaseCollection: (collectionId: string) => void
  hasCourse: (courseId: string) => boolean
  hasSeries: (seriesId: string) => boolean
  hasPathway: (pathwayId: string) => boolean
  hasCollection: (collectionId: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('auth_user')
    const storedToken = localStorage.getItem('auth_token')
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    } else {
      // Mock user for demo
      const mockUser = {
        id: '1',
        name: 'João Silva',
        email: 'joao@example.com',
        level: 5,
        xp: 2450,
        streak: 7
      }
      setUser(mockUser)
      setToken('mock-token-123')
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      localStorage.setItem('auth_token', 'mock-token-123')
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login
    const mockUser = {
      id: '1',
      name: 'João Silva',
      email,
      level: 5,
      xp: 2450,
      streak: 7
    }
    setUser(mockUser)
    setToken('mock-token-123')
    localStorage.setItem('auth_user', JSON.stringify(mockUser))
    localStorage.setItem('auth_token', 'mock-token-123')
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
  }

  // Purchase functions
  const purchaseCourse = (courseId: string) => {
    const purchased = JSON.parse(localStorage.getItem('purchased_courses') || '[]')
    if (!purchased.includes(courseId)) {
      purchased.push(courseId)
      localStorage.setItem('purchased_courses', JSON.stringify(purchased))
    }
  }

  const purchaseSeries = (seriesId: string) => {
    const purchased = JSON.parse(localStorage.getItem('purchased_series') || '[]')
    if (!purchased.includes(seriesId)) {
      purchased.push(seriesId)
      localStorage.setItem('purchased_series', JSON.stringify(purchased))
    }
  }

  const purchasePathway = (pathwayId: string) => {
    const purchased = JSON.parse(localStorage.getItem('purchased_pathways') || '[]')
    if (!purchased.includes(pathwayId)) {
      purchased.push(pathwayId)
      localStorage.setItem('purchased_pathways', JSON.stringify(purchased))
      
      // Add all series from this pathway (mock logic)
      const pathwaySeries = getPathwaySeries(pathwayId)
      pathwaySeries.forEach(seriesId => purchaseSeries(seriesId))
    }
  }

  const purchaseCollection = (collectionId: string) => {
    const purchased = JSON.parse(localStorage.getItem('purchased_collections') || '[]')
    if (!purchased.includes(collectionId)) {
      purchased.push(collectionId)
      localStorage.setItem('purchased_collections', JSON.stringify(purchased))
      
      // Add all pathways from this collection (mock logic)
      const collectionPathways = getCollectionPathways(collectionId)
      collectionPathways.forEach(pathwayId => purchasePathway(pathwayId))
    }
  }

  // Check ownership functions
  const hasCourse = (courseId: string) => {
    const purchased = JSON.parse(localStorage.getItem('purchased_courses') || '[]')
    return purchased.includes(courseId)
  }

  const hasSeries = (seriesId: string) => {
    const purchased = JSON.parse(localStorage.getItem('purchased_series') || '[]')
    return purchased.includes(seriesId)
  }

  const hasPathway = (pathwayId: string) => {
    const purchased = JSON.parse(localStorage.getItem('purchased_pathways') || '[]')
    return purchased.includes(pathwayId)
  }

  const hasCollection = (collectionId: string) => {
    const purchased = JSON.parse(localStorage.getItem('purchased_collections') || '[]')
    return purchased.includes(collectionId)
  }

  // Mock helper functions
  const getPathwaySeries = (pathwayId: string): string[] => {
    return [`series-${pathwayId}-1`, `series-${pathwayId}-2`]
  }

  const getCollectionPathways = (collectionId: string): string[] => {
    return [`pathway-${collectionId}-1`, `pathway-${collectionId}-2`]
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        purchaseCourse,
        purchaseSeries,
        purchasePathway,
        purchaseCollection,
        hasCourse,
        hasSeries,
        hasPathway,
        hasCollection,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
